import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalize, buildFallbackResult, hashImage, computeSugarImpact, extractJson } from '@/lib/ai/mealScan';
import { checkRateLimit, getRateLimitRemaining } from '@/lib/rateLimit';
import { lookupAllFoods } from '@/lib/nutrition/usda';

const SYSTEM_PROMPT = `You are SugarSense AI, a food recognition engine for a diabetes tracking app.

Your ONLY job is food identification and portion estimation from images.

RULES:
- Identify all visible food items
- Estimate portion size in household terms and grams
- Assign confidence scores (0 to 1)
- Be conservative — lower confidence if unsure
- Do NOT output calories, carbs, or any nutrition values
- Do NOT give medical advice

Return ONLY valid JSON matching this schema:
{
  "foods": [
    {
      "name": "string",
      "portion_description": "string (e.g. 1 cup, 2 slices, small bowl)",
      "estimated_grams": number,
      "confidence": number
    }
  ],
  "meal_summary": "short string",
  "overall_confidence": number,
  "notes": ["string"]
}`;

async function callGemini(base64: string, mimeType: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: SYSTEM_PROMPT + '\n\nAnalyze this food image and return ONLY valid JSON.' },
          { inlineData: { mimeType, data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 800 },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callGroq(base64: string, mimeType: string): Promise<{ content: string | null; error: string }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { content: null, error: 'No GROQ_API_KEY' };

  const modelsToTry = [
    process.env.GROQ_VISION_MODEL,
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'qwen/qwen3.6-27b',
  ].filter(Boolean) as string[];

  let lastError = '';
  for (const model of modelsToTry) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        max_tokens: 800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this food image and return ONLY valid JSON.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      lastError = `Groq ${model}: ${res.status} ${await res.text()}`;
      continue;
    }

    const raw = await res.text();
    console.log(`GROQ ${model} RAW:`, raw.substring(0, 500));
    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content || null;
    if (content) return { content };
  }

  return { content: null, error: lastError || 'All Groq models failed' };
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(`scan:${ip}`, 10, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again in 60 seconds.', foods: [], notes: ['Rate limited'], overall_confidence: 0, meal_summary: '' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const imageHash = hashImage(base64);

    let content: string | null = null;
    let provider = '';
    let groqError = '';

    content = await callGemini(base64, mimeType);
    provider = 'gemini';

    if (!content) {
      const groqResult = await callGroq(base64, mimeType);
      content = groqResult.content;
      groqError = groqResult.error || '';
      provider = 'groq';
    }

    if (!content) {
      return NextResponse.json(
        buildFallbackResult(`AI unavailable. Gemini: quota/error, Groq: ${groqError || 'no response'}`)
      );
    }

    const extracted = extractJson(content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(extracted);
    } catch {
      console.log(`RAW CONTENT from ${provider}:`, content);
      return NextResponse.json(buildFallbackResult(`Invalid JSON from ${provider}`));
    }

    const normalized = validateAndNormalize(parsed);

    const nutritionMap = normalized.foods.length > 0
      ? await lookupAllFoods(normalized.foods.map((f) => ({ name: f.name, estimated_grams: f.estimated_grams })))
      : new Map();

    const foodsWithNutrition = normalized.foods.map((food) => ({
      ...food,
      nutrition: nutritionMap.get(food.name) || undefined,
    }));

    const sugarImpact = computeSugarImpact(foodsWithNutrition);

    return NextResponse.json({
      ...normalized,
      foods: foodsWithNutrition,
      image_hash: imageHash,
      provider,
      total_carbs: sugarImpact.total_carbs,
      sugar_impact: sugarImpact,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json(buildFallbackResult(message), { status: 500 });
  }
}

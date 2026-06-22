import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are SugarSense AI, a food recognition and nutrition estimation engine for a diabetes tracking application.

Your job is to analyze a food image and produce structured data that will later be used with a nutrition database (USDA).

IMPORTANT PRINCIPLES:
- You are NOT a medical professional
- You do NOT give medical advice or insulin recommendations
- You do NOT calculate final nutrition with certainty
- You ONLY estimate food type and portion size visually
- Nutrition values will be calculated by another system using a database

TASK:
Analyze the image and extract all visible food items.

For each item:
- Identify the food name
- Estimate portion size in common household terms
- Estimate weight in grams (approximate)
- Provide confidence score (0 to 1)

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "foods": [
    {
      "name": "string",
      "portion_description": "string (e.g. 1 cup, 2 slices, small bowl)",
      "estimated_grams": number,
      "confidence": number
    }
  ],
  "meal_summary": "short description of the meal",
  "overall_confidence": number,
  "notes": [
    "any uncertainty or assumptions"
  ]
}

RULES:
- Be conservative: if unsure, reduce confidence
- Do NOT guess exact nutrition values (no carbs, calories, etc.)
- Do NOT include explanations outside JSON
- Focus on visible food only
- If multiple foods exist, list them separately
- If image is unclear, say so in notes and lower confidence

FINAL GOAL:
Your output will be used by another system that maps food names to a nutrition database (USDA) to calculate carbohydrates and glucose impact. Your job is ONLY accurate food recognition and portion estimation.`;

function getApiKey() {
  return process.env.GROQ_API_KEY || '';
}

function getModel() {
  return process.env.GROQ_VISION_MODEL || 'llama-3.2-11b-vision-preview';
}

function getBaseUrl() {
  return process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64}`;

    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getModel(),
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify the foods in this image and estimate portions.' },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content from AI provider.' }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        foods: [],
        meal_summary: 'Could not parse AI response.',
        overall_confidence: 0,
        notes: ['AI response was not valid JSON'],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

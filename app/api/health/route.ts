import { NextResponse } from 'next/server';

export async function GET() {
  const groqRes = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
  });

  const groqModels = groqRes.ok ? await groqRes.json() : null;
  const availableVisionModels = groqModels?.data
    ?.filter((m: { input_modalities?: string[] }) => m.input_modalities?.includes("image"))
    ?.map((m: { id: string }) => m.id) ?? [];

  return NextResponse.json({
    groq_status: groqRes.status,
    groq_ok: groqRes.ok,
    env_groq_key_set: !!process.env.GROQ_API_KEY,
    env_gemini_key_set: !!process.env.GEMINI_API_KEY,
    env_groq_vision_model: process.env.GROQ_VISION_MODEL || '(not set)',
    available_vision_models: availableVisionModels,
    node_version: process.version,
    platform: process.platform,
  });
}

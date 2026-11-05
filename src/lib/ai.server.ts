import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const OPENAI_MODEL = "openai/gpt-6-astra";
export const GEMINI_MODEL = "google/gemini-3-flash-preview";

export type ModelResult = { text: string | null; error: string | null; latencyMs: number };

function friendlyError(e: unknown): string {
  const err = e as { statusCode?: number; message?: string };
  const s = err?.statusCode;
  if (s === 429) return "Rate limit reached. Please wait a moment and try again.";
  if (s === 402) return "AI credits exhausted. Add credits to continue.";
  if (s === 401) return "API key is invalid or missing on the server.";
  if (s === 403) return err.message || "Access to this model was denied.";
  return err?.message?.slice(0, 300) || "The model request failed.";
}

const SYSTEM = "You are a helpful, accurate assistant. Answer the user's question clearly.";

export async function callOpenAI(question: string, apiKey: string): Promise<ModelResult> {
  const t0 = Date.now();
  try {
    const openai = createOpenAI({
      baseURL: BASE_URL,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: openai.responses(OPENAI_MODEL),
      system: SYSTEM,
      prompt: question,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    if (!text.trim()) return { text: null, error: "The model returned an empty response.", latencyMs: Date.now() - t0 };
    return { text, error: null, latencyMs: Date.now() - t0 };
  } catch (e) {
    console.error("OpenAI error", e);
    return { text: null, error: friendlyError(e), latencyMs: Date.now() - t0 };
  }
}

export async function callGemini(question: string, apiKey: string): Promise<ModelResult> {
  const t0 = Date.now();
  try {
    const provider = createOpenAICompatible({
      name: "lovable",
      baseURL: BASE_URL,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({ model: provider(GEMINI_MODEL), system: SYSTEM, prompt: question, maxRetries: 0 });
    const text = await result.text;
    if (!text.trim()) return { text: null, error: "The model returned an empty response.", latencyMs: Date.now() - t0 };
    return { text, error: null, latencyMs: Date.now() - t0 };
  } catch (e) {
    console.error("Gemini error", e);
    return { text: null, error: friendlyError(e), latencyMs: Date.now() - t0 };
  }
}

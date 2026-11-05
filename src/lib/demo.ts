import type { EvalRow } from "./metrics";

/** SAMPLE DATA — shown only in Demo Mode, never saved or mixed with real results. */
export const DEMO_EVALUATIONS: EvalRow[] = [
  {
    id: "demo-1",
    question: "[SAMPLE] Explain the difference between TCP and UDP in two sentences.",
    openai_model: "openai/gpt-6-astra",
    gemini_model: "google/gemini-3-flash-preview",
    openai_response: "[Sample response] TCP is connection-oriented and guarantees ordered delivery. UDP is connectionless and faster but offers no delivery guarantees.",
    gemini_response: "[Sample response] TCP establishes a reliable session with acknowledgements, while UDP just sends datagrams with minimal overhead.",
    openai_error: null, gemini_error: null,
    openai_latency_ms: 1800, gemini_latency_ms: 1200,
    openai_rating: 4, gemini_rating: 4, preferred_model: "tie", notes: "Sample note",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "demo-2",
    question: "[SAMPLE] Write a haiku about debugging.",
    openai_model: "openai/gpt-6-astra",
    gemini_model: "google/gemini-3-flash-preview",
    openai_response: "[Sample response] Silent stack trace glows / one missing semicolon / dawn breaks, tests pass green",
    gemini_response: "[Sample response] Bugs hide in the night / console logs like lanterns / found you, null pointer",
    openai_error: null, gemini_error: null,
    openai_latency_ms: 2100, gemini_latency_ms: 900,
    openai_rating: 5, gemini_rating: 3, preferred_model: "openai", notes: null,
    created_at: "2026-01-02T10:00:00Z",
  },
  {
    id: "demo-3",
    question: "[SAMPLE] What is 17 × 23?",
    openai_model: "openai/gpt-6-astra",
    gemini_model: "google/gemini-3-flash-preview",
    openai_response: "[Sample response] 391",
    gemini_response: null,
    openai_error: null, gemini_error: "[Sample error] Rate limit reached.",
    openai_latency_ms: 700, gemini_latency_ms: 300,
    openai_rating: 5, gemini_rating: null, preferred_model: "openai", notes: null,
    created_at: "2026-01-03T10:00:00Z",
  },
];

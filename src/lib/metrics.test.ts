import { describe, it, expect } from "vitest";
import { computeMetrics, type EvalRow } from "./metrics";

const row = (p: Partial<EvalRow>): EvalRow => ({
  id: "x", question: "q", openai_model: "o", gemini_model: "g",
  openai_response: "a", gemini_response: "b", openai_error: null, gemini_error: null,
  openai_latency_ms: null, gemini_latency_ms: null, openai_rating: null, gemini_rating: null,
  preferred_model: null, notes: null, created_at: "", ...p,
});

describe("computeMetrics", () => {
  it("returns no scores when there is no saved data", () => {
    const m = computeMetrics([]);
    expect(m.total).toBe(0);
    expect(m.openaiAvgRating).toBeNull();
    expect(m.openaiWinRate).toBeNull();
  });
  it("computes win rate only from judged evaluations", () => {
    const m = computeMetrics([row({ preferred_model: "openai" }), row({ preferred_model: "gemini" }), row({ preferred_model: "openai" }), row({})]);
    expect(m.judged).toBe(3);
    expect(m.openaiWinRate).toBeCloseTo(2 / 3);
  });
  it("averages ratings ignoring unrated rows", () => {
    const m = computeMetrics([row({ gemini_rating: 4 }), row({ gemini_rating: 2 }), row({})]);
    expect(m.geminiAvgRating).toBe(3);
  });
});

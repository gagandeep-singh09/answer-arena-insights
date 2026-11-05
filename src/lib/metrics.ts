export type EvalRow = {
  id: string;
  question: string;
  openai_model: string;
  gemini_model: string;
  openai_response: string | null;
  gemini_response: string | null;
  openai_error: string | null;
  gemini_error: string | null;
  openai_latency_ms: number | null;
  gemini_latency_ms: number | null;
  openai_rating: number | null;
  gemini_rating: number | null;
  preferred_model: string | null;
  notes: string | null;
  created_at: string;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Computes metrics strictly from the rows passed in. Returns null averages when no data exists. */
export function computeMetrics(rows: EvalRow[]) {
  const nums = (f: (r: EvalRow) => number | null) => rows.map(f).filter((x): x is number => x != null);
  const decided = rows.filter((r) => r.preferred_model);
  const count = (m: string) => decided.filter((r) => r.preferred_model === m).length;
  return {
    total: rows.length,
    judged: decided.length,
    openaiWins: count("openai"),
    geminiWins: count("gemini"),
    ties: count("tie"),
    openaiWinRate: decided.length ? count("openai") / decided.length : null,
    geminiWinRate: decided.length ? count("gemini") / decided.length : null,
    openaiAvgRating: avg(nums((r) => r.openai_rating)),
    geminiAvgRating: avg(nums((r) => r.gemini_rating)),
    openaiAvgLatency: avg(nums((r) => r.openai_latency_ms)),
    geminiAvgLatency: avg(nums((r) => r.gemini_latency_ms)),
    openaiErrors: rows.filter((r) => r.openai_error).length,
    geminiErrors: rows.filter((r) => r.gemini_error).length,
  };
}

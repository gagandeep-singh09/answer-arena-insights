import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel } from "@/components/AppShell";
import { ResponseCard, VerdictEditor } from "@/components/Verdict";
import { runEvaluation } from "@/lib/eval.functions";
import { useDemoMode, useStatus } from "@/lib/use-app";
import { DEMO_EVALUATIONS } from "@/lib/demo";
import type { EvalRow } from "@/lib/metrics";

export const Route = createFileRoute("/evaluate")({
  head: () => ({
    meta: [
      { title: "Run Evaluation — AI Product Evaluator" },
      { name: "description", content: "Send one question to OpenAI and Gemini and compare answers side by side." },
      { property: "og:title", content: "Run Evaluation — AI Product Evaluator" },
      { property: "og:description", content: "Send one question to OpenAI and Gemini and compare answers side by side." },
    ],
  }),
  component: Evaluate,
});

function Evaluate() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<EvalRow | null>(null);
  const run = useServerFn(runEvaluation);
  const { demo, forced } = useDemoMode();
  const status = useStatus();
  const qc = useQueryClient();

  const submit = async () => {
    setErr(null);
    setResult(null);
    if (demo) {
      setResult({ ...DEMO_EVALUATIONS[0], question: "[SAMPLE] " + q });
      return;
    }
    setLoading(true);
    try {
      const row = await run({ data: { question: q } });
      setResult(row as EvalRow);
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Run Evaluation" subtitle="The exact same question is sent to both models on the server." />
      <Panel>
        <Textarea rows={4} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything, e.g. Explain quantum entanglement to a 10 year old." maxLength={4000} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {demo ? (forced ? "Demo mode: AI keys are not configured, a sample response will be shown and nothing is saved." : "Demo mode is on (turn it off in Settings). Nothing is saved.") : `Models: ${status.data?.openaiModel ?? "…"} vs ${status.data?.geminiModel ?? "…"}`}
          </span>
          <Button variant="hero" onClick={submit} disabled={loading || q.trim().length < 3}>
            {loading ? <Loader2 className="animate-spin" /> : <Send />} {loading ? "Asking both models…" : "Compare answers"}
          </Button>
        </div>
      </Panel>

      {err && <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{err}</div>}

      {loading && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResponseCard side="openai" model={status.data?.openaiModel ?? ""} text={null} error={null} latency={null} loading rating={null} />
          <ResponseCard side="gemini" model={status.data?.geminiModel ?? ""} text={null} error={null} latency={null} loading rating={null} />
        </div>
      )}

      {result && (
        <div className="mt-6">
          {demo && <div className="mb-3 text-xs font-semibold text-warning">SAMPLE DATA — not a real model response</div>}
          <VerdictEditor key={result.id + result.question} row={result} readOnly={demo} />
          {!demo && <p className="mt-3 text-xs text-muted-foreground">Saved. See it later in <Link to="/history" className="text-primary underline">History</Link>.</p>}
        </div>
      )}
    </div>
  );
}

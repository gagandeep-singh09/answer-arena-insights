import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Empty, fmt } from "@/components/AppShell";
import { useEvaluations } from "@/lib/use-app";
import { computeMetrics } from "@/lib/metrics";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AI Product Evaluator" },
      { name: "description", content: "Head-to-head report of OpenAI vs Gemini built from saved evaluations." },
      { property: "og:title", content: "Reports — AI Product Evaluator" },
      { property: "og:description", content: "Head-to-head report of OpenAI vs Gemini built from saved evaluations." },
    ],
  }),
  component: Reports,
});

function Bar({ label, a, b, format }: { label: string; a: number | null; b: number | null; format: (v: number | null) => string }) {
  const max = Math.max(a ?? 0, b ?? 0) || 1;
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {([["OpenAI", a, "bg-openai"], ["Gemini", b, "bg-gemini"]] as const).map(([n, v, c]) => (
        <div key={n} className="flex items-center gap-3 text-xs">
          <span className="w-14 text-muted-foreground">{n}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${c}`} style={{ width: `${((v ?? 0) / max) * 100}%` }} />
          </div>
          <span className="w-14 text-right">{format(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const { rows, isLoading, demo } = useEvaluations();
  const m = computeMetrics(rows);

  const exportCsv = () => {
    const cols = ["created_at", "question", "openai_model", "gemini_model", "openai_rating", "gemini_rating", "preferred_model", "openai_latency_ms", "gemini_latency_ms", "openai_error", "gemini_error"] as const;
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = demo ? "sample-evaluations.csv" : "evaluations.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Reports" subtitle={demo ? "SAMPLE report — not real results." : `Based on ${m.total} saved evaluations (${m.judged} judged).`} />
        <Button variant="outline" onClick={exportCsv} disabled={!rows.length}><Download /> Export CSV</Button>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : m.total === 0 ? <Empty>No saved data yet — reports appear after your first evaluation.</Empty> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="space-y-6">
            <h2 className="font-semibold">Head to head</h2>
            <Bar label="Wins" a={m.openaiWins} b={m.geminiWins} format={(v) => String(v ?? 0)} />
            <Bar label="Average rating (1–5)" a={m.openaiAvgRating} b={m.geminiAvgRating} format={fmt.rating} />
            <Bar label="Average response time" a={m.openaiAvgLatency} b={m.geminiAvgLatency} format={fmt.ms} />
            <Bar label="Failed responses" a={m.openaiErrors} b={m.geminiErrors} format={(v) => String(v ?? 0)} />
          </Panel>
          <Panel>
            <h2 className="mb-4 font-semibold">Summary</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Total evaluations</dt><dd>{m.total}</dd>
              <dt className="text-muted-foreground">Judged</dt><dd>{m.judged}</dd>
              <dt className="text-muted-foreground">Ties</dt><dd>{m.ties}</dd>
              <dt className="text-muted-foreground">OpenAI win rate</dt><dd className="text-openai">{fmt.pct(m.openaiWinRate)}</dd>
              <dt className="text-muted-foreground">Gemini win rate</dt><dd className="text-gemini">{fmt.pct(m.geminiWinRate)}</dd>
            </dl>
            {m.judged === 0 && <p className="mt-4 text-xs text-muted-foreground">No verdicts yet — win rates will appear once you pick a preferred answer.</p>}
          </Panel>
        </div>
      )}
    </div>
  );
}

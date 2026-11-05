import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Empty, fmt } from "@/components/AppShell";
import { useEvaluations, useBugs, useDemoMode } from "@/lib/use-app";
import { computeMetrics } from "@/lib/metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Product Evaluator" },
      { name: "description", content: "Live metrics from your saved OpenAI vs Gemini evaluations." },
      { property: "og:title", content: "Dashboard — AI Product Evaluator" },
      { property: "og:description", content: "Live metrics from your saved OpenAI vs Gemini evaluations." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <Panel>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${tone}`}>{value}</div>
    </Panel>
  );
}

function Dashboard() {
  const { rows, isLoading, error, demo } = useEvaluations();
  const { demo: demoMode } = useDemoMode();
  const bugs = useBugs();
  const m = computeMetrics(rows);
  const openBugs = demoMode ? null : (bugs.data ?? []).filter((b) => b.status !== "resolved").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Dashboard" subtitle={demo ? "Showing clearly labelled SAMPLE data." : "Metrics calculated only from your saved evaluations."} />
        <Button variant="hero" asChild>
          <Link to="/evaluate"><FlaskConical /> Run evaluation</Link>
        </Button>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">Could not load evaluations: {error.message}</p>}
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : m.total === 0 ? (
        <Empty>No evaluations saved yet. Run your first evaluation to see real metrics here.</Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Evaluations" value={String(m.total)} />
            <Stat label="Judged" value={String(m.judged)} />
            <Stat label="OpenAI win rate" value={fmt.pct(m.openaiWinRate)} tone="text-openai" />
            <Stat label="Gemini win rate" value={fmt.pct(m.geminiWinRate)} tone="text-gemini" />
            <Stat label="OpenAI avg rating" value={fmt.rating(m.openaiAvgRating)} tone="text-openai" />
            <Stat label="Gemini avg rating" value={fmt.rating(m.geminiAvgRating)} tone="text-gemini" />
            <Stat label="Ties" value={String(m.ties)} />
            <Stat label="Open bugs" value={openBugs == null ? "—" : String(openBugs)} />
          </div>
          <Panel className="mt-6">
            <h2 className="mb-4 font-semibold">Recent evaluations</h2>
            <ul className="divide-y divide-border">
              {rows.slice(0, 5).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="max-w-xl truncate">{r.question}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.preferred_model ? `Preferred: ${r.preferred_model}` : "Not judged"} · {fmt.date(r.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

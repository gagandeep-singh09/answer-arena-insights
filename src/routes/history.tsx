import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Empty, fmt } from "@/components/AppShell";
import { VerdictEditor } from "@/components/Verdict";
import { useEvaluations } from "@/lib/use-app";
import { deleteEvaluation } from "@/lib/eval.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Product Evaluator" },
      { name: "description", content: "Browse every saved question, both answers and your verdicts." },
      { property: "og:title", content: "History — AI Product Evaluator" },
      { property: "og:description", content: "Browse every saved question, both answers and your verdicts." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { rows, isLoading, demo } = useEvaluations();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const del = useServerFn(deleteEvaluation);
  const qc = useQueryClient();
  const list = rows.filter((r) => r.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="History" subtitle={demo ? "SAMPLE data shown in demo mode." : "All saved evaluations."} />
      <Input className="mb-4 max-w-sm" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty>No evaluations found.</Empty> : (
        <div className="space-y-3">
          {list.map((r) => (
            <Panel key={r.id} className="p-0">
              <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(open === r.id ? null : r.id)}>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.question}</div>
                  <div className="text-xs text-muted-foreground">
                    {fmt.date(r.created_at)} · {r.preferred_model ? `Preferred: ${r.preferred_model}` : "Not judged"}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${open === r.id ? "rotate-180" : ""}`} />
              </button>
              {open === r.id && (
                <div className="border-t border-border p-4">
                  <VerdictEditor row={r} readOnly={demo} />
                  {!demo && (
                    <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={async () => {
                      if (!confirm("Delete this evaluation?")) return;
                      await del({ data: { id: r.id } });
                      toast.success("Deleted");
                      qc.invalidateQueries({ queryKey: ["evaluations"] });
                    }}><Trash2 /> Delete</Button>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

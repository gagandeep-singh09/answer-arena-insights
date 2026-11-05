import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, Empty, fmt } from "@/components/AppShell";
import { useBugs, useDemoMode } from "@/lib/use-app";
import { createBug, updateBugStatus } from "@/lib/eval.functions";

export const Route = createFileRoute("/bugs")({
  head: () => ({
    meta: [
      { title: "Bug Reports — AI Product Evaluator" },
      { name: "description", content: "Log and track issues found in AI model responses." },
      { property: "og:title", content: "Bug Reports — AI Product Evaluator" },
      { property: "og:description", content: "Log and track issues found in AI model responses." },
    ],
  }),
  component: Bugs,
});

const sel = "h-9 rounded-md border border-input bg-background px-3 text-sm";
const sevTone: Record<string, string> = { low: "text-muted-foreground", medium: "text-warning", high: "text-destructive", critical: "text-destructive font-bold" };

function Bugs() {
  const bugs = useBugs();
  const { demo } = useDemoMode();
  const create = useServerFn(createBug);
  const update = useServerFn(updateBugStatus);
  const qc = useQueryClient();
  const [f, setF] = useState({ title: "", description: "", model: "openai", severity: "medium" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { ...f, model: f.model as "openai", severity: f.severity as "medium", evaluation_id: null } });
      setF({ title: "", description: "", model: "openai", severity: "medium" });
      toast.success("Bug reported");
      qc.invalidateQueries({ queryKey: ["bugs"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Bug Reports" subtitle="Track hallucinations, wrong answers or failures from either model." />
      {demo && <p className="mb-4 text-xs text-warning">Bug reports are always real records; demo mode does not add sample bugs.</p>}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel>
          <form onSubmit={submit} className="space-y-3">
            <h2 className="font-semibold">New report</h2>
            <Input required minLength={3} placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            <Textarea placeholder="What went wrong?" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            <div className="flex gap-2">
              <select className={sel} value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })}>
                <option value="openai">OpenAI</option><option value="gemini">Gemini</option><option value="both">Both</option>
              </select>
              <select className={sel} value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>
                {["low", "medium", "high", "critical"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Button type="submit" variant="hero" disabled={busy}>Submit report</Button>
          </form>
        </Panel>
        <div className="space-y-3">
          {bugs.isLoading ? <p className="text-muted-foreground">Loading…</p> : !bugs.data?.length ? <Empty>No bug reports yet.</Empty> : bugs.data.map((b) => (
            <Panel key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{b.model} · <span className={sevTone[b.severity]}>{b.severity}</span> · {fmt.date(b.created_at)}</div>
                </div>
                <select className={sel} value={b.status} onChange={async (e) => {
                  await update({ data: { id: b.id, status: e.target.value as "open" } });
                  qc.invalidateQueries({ queryKey: ["bugs"] });
                }}>
                  <option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option>
                </select>
              </div>
              {b.description && <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>}
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}

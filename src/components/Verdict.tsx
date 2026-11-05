import { useState } from "react";
import { Star, Loader2, AlertTriangle, Trophy } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveVerdict } from "@/lib/eval.functions";
import { fmt } from "@/components/AppShell";
import type { EvalRow } from "@/lib/metrics";

export function Stars({ value, onChange }: { value: number | null; onChange?: ((v: number) => void) | undefined }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} stars`}>
          <Star className={`h-5 w-5 ${value && n <= value ? "fill-warning text-warning" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export function ResponseCard({
  side, model, text, error, latency, loading, rating, onRate, preferred,
}: {
  side: "openai" | "gemini"; model: string; text: string | null; error: string | null; latency: number | null;
  loading?: boolean; rating: number | null; onRate?: ((v: number) => void) | undefined; preferred?: boolean;
}) {
  const tone = side === "openai" ? "border-openai/40" : "border-gemini/40";
  return (
    <div className={`flex flex-col rounded-xl border-2 bg-card p-5 ${preferred ? "shadow-glow " + tone : "border-border"}`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className={`font-display font-bold ${side === "openai" ? "text-openai" : "text-gemini"}`}>
            {side === "openai" ? "OpenAI" : "Google Gemini"}
          </div>
          <div className="text-xs text-muted-foreground">{model}</div>
        </div>
        {preferred && <Trophy className="h-5 w-5 text-warning" />}
      </div>
      <div className="min-h-32 flex-1 whitespace-pre-wrap text-sm leading-relaxed">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Generating…</div>
        ) : error ? (
          <div className="flex gap-2 text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</div>
        ) : (
          text
        )}
      </div>
      {!loading && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <Stars value={rating} onChange={error ? undefined : onRate} />
          <span className="text-xs text-muted-foreground">{fmt.ms(latency)}</span>
        </div>
      )}
    </div>
  );
}

export function VerdictEditor({ row, readOnly }: { row: EvalRow; readOnly?: boolean }) {
  const [oR, setOR] = useState(row.openai_rating);
  const [gR, setGR] = useState(row.gemini_rating);
  const [pref, setPref] = useState(row.preferred_model);
  const [notes, setNotes] = useState(row.notes ?? "");
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveVerdict);
  const qc = useQueryClient();

  const submit = async () => {
    setSaving(true);
    try {
      await save({ data: { id: row.id, openai_rating: oR, gemini_rating: gR, preferred_model: pref as "openai" | "gemini" | "tie" | null, notes: notes || null } });
      toast.success("Verdict saved");
      qc.invalidateQueries({ queryKey: ["evaluations"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ResponseCard side="openai" model={row.openai_model} text={row.openai_response} error={row.openai_error} latency={row.openai_latency_ms} rating={oR} onRate={readOnly ? undefined : setOR} preferred={pref === "openai"} />
        <ResponseCard side="gemini" model={row.gemini_model} text={row.gemini_response} error={row.gemini_error} latency={row.gemini_latency_ms} rating={gR} onRate={readOnly ? undefined : setGR} preferred={pref === "gemini"} />
      </div>
      {!readOnly && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 text-sm font-semibold">Which answer do you prefer?</div>
          <div className="flex flex-wrap gap-2">
            {(["openai", "gemini", "tie"] as const).map((p) => (
              <Button key={p} variant={pref === p ? "hero" : "outline"} onClick={() => setPref(p)}
                disabled={(p === "openai" && !!row.openai_error) || (p === "gemini" && !!row.gemini_error)}>
                {p === "openai" ? "OpenAI" : p === "gemini" ? "Gemini" : "Tie"}
              </Button>
            ))}
          </div>
          <Textarea className="mt-4" placeholder="Optional notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button className="mt-4" onClick={submit} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />} Save verdict
          </Button>
        </div>
      )}
    </div>
  );
}

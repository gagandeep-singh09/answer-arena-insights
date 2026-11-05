import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel } from "@/components/AppShell";
import { useDemoMode, useStatus } from "@/lib/use-app";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Product Evaluator" },
      { name: "description", content: "AI connection status and demo mode settings." },
      { property: "og:title", content: "Settings — AI Product Evaluator" },
      { property: "og:description", content: "AI connection status and demo mode settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const status = useStatus();
  const { demo, forced, setDemo } = useDemoMode();
  const ok = status.data?.configured;
  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Settings" />
      <Panel>
        <h2 className="mb-3 font-semibold">AI connection</h2>
        <div className="flex items-center gap-2 text-sm">
          {ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
          {status.isLoading ? "Checking…" : ok ? "API keys configured on the server" : "API keys not configured"}
        </div>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>OpenAI model: {status.data?.openaiModel ?? "—"}</li>
          <li>Gemini model: {status.data?.geminiModel ?? "—"}</li>
        </ul>
        <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
          Keys are stored only as server-side secrets and are never sent to the browser.
        </p>
      </Panel>
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Demo mode</h2>
            <p className="text-sm text-muted-foreground">
              Shows clearly labelled sample data. Nothing is saved and real metrics are hidden.
              {forced && " It stays on until AI keys are configured."}
            </p>
          </div>
          <Switch checked={demo} disabled={forced} onCheckedChange={setDemo} />
        </div>
      </Panel>
    </div>
  );
}

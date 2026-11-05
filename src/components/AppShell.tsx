import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, FlaskConical, BarChart3, Bug, History, Settings, Menu, X, Sparkles } from "lucide-react";
import { useDemoMode } from "@/lib/use-app";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/evaluate", label: "Run Evaluation", icon: FlaskConical },
  { to: "/reports", label: "View Reports", icon: BarChart3 },
  { to: "/bugs", label: "Bug Reports", icon: Bug },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { demo, forced } = useDemoMode();
  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar p-4 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display text-sm font-bold leading-tight text-sidebar-foreground">
            AI Product
            <br />
            <span className="text-gradient">Evaluator</span>
          </div>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-semibold" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto">
            {demo ? (
              <span className="rounded-full border border-warning/50 bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                DEMO MODE — sample data{forced ? " (AI keys not configured)" : ""}
              </span>
            ) : (
              <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                Live — real saved data
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card/80 p-5 backdrop-blur ${className}`}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{children}</div>;
}

export const fmt = {
  rating: (v: number | null) => (v == null ? "—" : v.toFixed(2)),
  pct: (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)}%`),
  ms: (v: number | null) => (v == null ? "—" : `${(v / 1000).toFixed(2)}s`),
  date: (s: string) => new Date(s).toLocaleString(),
};

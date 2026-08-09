import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/assistant", label: "AI Assistant", icon: "🤖" },
  { to: "/find-help", label: "Find Help", icon: "📍" },
  { to: "/card", label: "Emergency Card", icon: "🪪" },
  { to: "/contacts", label: "Trusted Contacts", icon: "👥" },
  { to: "/reports", label: "Reports", icon: "📋" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3" aria-label="RESQ home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-danger font-display text-lg font-bold text-danger-foreground">
              R
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold">RESQ</span>
              <span className="block text-xs text-muted-foreground">From Panic to Action.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.to
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/emergency" className="btn btn-danger hidden px-4 sm:inline-flex">
              🚨 Emergency
            </Link>
            <button
              type="button"
              className="btn btn-ghost px-3 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-border px-4 py-2 md:hidden" aria-label="Mobile navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">{children}</main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        RESQ is an emergency-response assistance platform. It does not replace ambulance, police or fire
        services, and it never dispatches responders on your behalf. This prototype stores your data only on
        this device.
      </footer>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        {icon ? <span aria-hidden>{icon} </span> : null}
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm shadow-card"
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const show = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2600);
  };
  return { message, show };
}

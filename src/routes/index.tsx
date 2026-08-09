import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/resq/app-shell";
import { EMERGENCY_FLOWS } from "@/lib/resq/flows";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ — Emergency Assistance, From Panic to Action" },
      {
        name: "description",
        content:
          "RESQ guides you through an emergency: identify what happened, get concise steps, share your location, find nearby help and generate a responder brief.",
      },
      { property: "og:title", content: "RESQ — From Panic to Action" },
      {
        property: "og:description",
        content:
          "An emergency-response assistance platform: identify, guide, locate, communicate, connect.",
      },
    ],
  }),
  component: Dashboard,
});

const UTILITIES = [
  { to: "/card", icon: "🪪", label: "My Emergency Card", desc: "Blood group, allergies, contact" },
  { to: "/contacts", icon: "👥", label: "Trusted Contacts", desc: "Call or share location fast" },
  { to: "/find-help", icon: "📍", label: "Find Help", desc: "Hospitals, police, fire, pharmacy" },
  { to: "/reports", icon: "📋", label: "Emergency Reports", desc: "Briefs saved on this device" },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <section className="surface-card relative overflow-hidden p-6 sm:p-9">
        <span className="chip chip-safe">
          <span className="pulse-dot" aria-hidden /> System ready
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
          Turn a chaotic emergency into a <span className="text-gradient-danger">structured response</span>.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Identify → Guide → Locate → Communicate → Connect. RESQ asks a few simple questions, then builds a
          brief you can read out to responders.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/emergency" className="btn btn-danger flex-1 text-lg sm:flex-none sm:px-8">
            🚨 START EMERGENCY
          </Link>
          <Link to="/assistant" className="btn btn-outline flex-1 sm:flex-none sm:px-6">
            🤖 Describe it instead
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">What happened? We'll guide you.</p>
      </section>

      <section className="mt-8" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="mb-3 font-display text-lg font-semibold">
          Emergency categories
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EMERGENCY_FLOWS.map((flow) => (
            <Link
              key={flow.id}
              to="/emergency"
              search={{ type: flow.id }}
              className="surface-card flex items-center gap-4 p-4 transition-colors hover:border-danger"
            >
              <span aria-hidden className="text-2xl">
                {flow.icon}
              </span>
              <span>
                <span className="block font-semibold">{flow.label}</span>
                <span className="block text-xs text-muted-foreground">{flow.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="mb-3 font-display text-lg font-semibold">
          Be ready before it happens
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {UTILITIES.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="surface-card flex items-center gap-4 p-4 transition-colors hover:border-primary"
            >
              <span aria-hidden className="text-2xl">
                {item.icon}
              </span>
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

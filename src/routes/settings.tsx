import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader, Toast, useToast } from "@/components/resq/app-shell";
import { requestLocation } from "@/lib/resq/location";
import { clearAllLocalData, useSettings } from "@/lib/resq/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Privacy — RESQ" },
      {
        name: "description",
        content:
          "Manage location permission, alert preferences and locally stored data, and read what RESQ does and does not do.",
      },
      { property: "og:title", content: "Settings & Privacy — RESQ" },
      { property: "og:description", content: "Permissions, alert preferences and local data controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const { message, show } = useToast();

  const toggle = (key: keyof typeof settings) => saveSettings({ ...settings, [key]: !settings[key] });

  return (
    <AppShell>
      <PageHeader icon="⚙️" title="Settings" subtitle="Permissions, preferences and privacy for this prototype." />

      <section className="surface-card p-5">
        <h2 className="font-display text-lg font-semibold">Your information</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link to="/card" className="btn btn-outline">
            🪪 Emergency card
          </Link>
          <Link to="/contacts" className="btn btn-outline">
            👥 Trusted contacts
          </Link>
          <Link to="/reports" className="btn btn-outline">
            📋 Reports
          </Link>
        </div>
      </section>

      <section className="surface-card mt-4 p-5">
        <h2 className="font-display text-lg font-semibold">Preferences</h2>
        <ul className="mt-3 divide-y divide-border">
          {(
            [
              { key: "autoLocation", label: "Detect location automatically in emergency mode" },
              { key: "loudAlerts", label: "Prefer loud, high-contrast emergency screens" },
              { key: "discreetMode", label: "Always show Quick Exit in sensitive flows" },
            ] as const
          ).map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm">{item.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings[item.key]}
                aria-label={item.label}
                onClick={() => toggle(item.key)}
                className={settings[item.key] ? "chip chip-safe" : "chip"}
              >
                {settings[item.key] ? "On" : "Off"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card mt-4 p-5">
        <h2 className="font-display text-lg font-semibold">Location permission</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your browser controls this. Test it here — RESQ only reads your position while you have a screen open.
        </p>
        <button
          type="button"
          className="btn btn-outline mt-3"
          onClick={async () => {
            try {
              await requestLocation();
              show("Location permission working");
            } catch (e) {
              show((e as Error).message);
            }
          }}
        >
          📍 Test location access
        </button>
      </section>

      <section className="surface-card mt-4 p-5">
        <h2 className="font-display text-lg font-semibold">Privacy</h2>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          <li>• This is a prototype. Your card, contacts and reports are stored unencrypted in this browser.</li>
          <li>• Nothing is uploaded to a server, and nothing is shared until you tap share or call.</li>
          <li>• Medical and emergency details are sensitive — only add what you are comfortable storing here.</li>
        </ul>
        <button
          type="button"
          className="btn btn-danger mt-4"
          onClick={() => {
            clearAllLocalData();
            show("Local data cleared — reload to see the change");
          }}
        >
          Delete all local data
        </button>
      </section>

      <section className="surface-card mt-4 p-5">
        <h2 className="font-display text-lg font-semibold">About RESQ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          RESQ is an emergency-response assistance platform — a bridge between the person in an emergency and the
          right source of help. It does not replace hospitals, police, fire or ambulance services, it is not a
          doctor, and it never dispatches responders or contacts hospitals on your behalf.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Workflow: Identify → Guide → Locate → Communicate → Connect.</p>
      </section>

      <Toast message={message} />
    </AppShell>
  );
}

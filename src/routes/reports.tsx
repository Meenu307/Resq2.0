import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader, Toast, useToast } from "@/components/resq/app-shell";
import { copyText, mapsLink, shareText } from "@/lib/resq/location";
import { useReports } from "@/lib/resq/storage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Emergency Reports — Saved Briefs | RESQ" },
      {
        name: "description",
        content:
          "Every emergency brief you generate is saved on this device, with type, time, location and the answers you gave.",
      },
      { property: "og:title", content: "Emergency Reports — RESQ" },
      { property: "og:description", content: "Your generated emergency briefs, kept on this device." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { reports, removeReport, clearReports } = useReports();
  const [openId, setOpenId] = useState<string | null>(null);
  const { message, show } = useToast();

  return (
    <AppShell>
      <PageHeader
        icon="📋"
        title="Emergency Reports"
        subtitle="Prototype storage: these briefs live in this browser only and are not encrypted."
      />

      {reports.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="font-display text-lg font-semibold">No reports yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run an emergency flow and generate a brief — it will appear here.
          </p>
          <Link to="/emergency" className="btn btn-danger mt-5">
            🚨 Start emergency
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {reports.map((r) => (
              <article key={r.id} className="surface-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span aria-hidden className="text-2xl">
                      {r.icon}
                    </span>
                    <div>
                      <h2 className="font-semibold">{r.flowLabel}</h2>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.timestamp).toLocaleString()} ·{" "}
                        {r.location ? "Location saved" : "No location"}
                      </p>
                    </div>
                  </div>
                  <span className="chip chip-safe">{r.status}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-outline px-4 text-sm"
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    {openId === r.id ? "Hide brief" : "View brief"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline px-4 text-sm"
                    onClick={async () => show((await copyText(r.report)) ? "Brief copied" : "Clipboard unavailable")}
                  >
                    📄 Copy
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline px-4 text-sm"
                    onClick={async () => {
                      const res = await shareText({ title: "RESQ Emergency Brief", text: r.report });
                      show(res === "shared" ? "Shared" : res === "copied" ? "Copied" : "Sharing unavailable");
                    }}
                  >
                    📤 Share
                  </button>
                  {r.location && (
                    <a href={mapsLink(r.location)} target="_blank" rel="noreferrer" className="btn btn-outline px-4 text-sm">
                      🗺️ Open map
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost px-4 text-sm"
                    onClick={() => removeReport(r.id)}
                  >
                    Delete
                  </button>
                </div>

                {openId === r.id && (
                  <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-4 text-sm">
                    {r.report}
                  </pre>
                )}
              </article>
            ))}
          </div>

          <button type="button" className="btn btn-ghost mt-5" onClick={clearReports}>
            Clear all reports
          </button>
        </>
      )}

      <Toast message={message} />
    </AppShell>
  );
}

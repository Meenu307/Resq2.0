import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/resq/app-shell";
import { analyzeEmergencyText, type Analysis } from "@/lib/resq/ai";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Describe Your Emergency | RESQ" },
      {
        name: "description",
        content:
          "Type what is happening in plain words. RESQ classifies the emergency, lists concerns and missing details, then routes you to the right guided flow.",
      },
      { property: "og:title", content: "RESQ AI Assistant" },
      { property: "og:description", content: "Describe the situation and get it structured for responders." },
    ],
  }),
  component: AssistantPage,
});

const EXAMPLES = [
  "My friend fell from a bike and has a cut on his arm. He is awake.",
  "There is smoke coming from the kitchen and we are still inside.",
  "An older man collapsed at the bus stop and is not waking up.",
];

function AssistantPage() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = (input: string) => {
    setError(null);
    setLoading(true);
    window.setTimeout(() => {
      const result = analyzeEmergencyText(input);
      if (!result) {
        setError("Please describe the situation in a few more words.");
        setAnalysis(null);
      } else {
        setAnalysis(result);
      }
      setLoading(false);
    }, 350);
  };

  return (
    <AppShell>
      <PageHeader
        icon="🤖"
        title="AI Assistant"
        subtitle="Describe the situation in plain words. RESQ structures it — it does not diagnose or prescribe treatment."
      />

      <form
        className="surface-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          run(text);
        }}
      >
        <label htmlFor="situation" className="text-sm font-semibold">
          What is happening?
        </label>
        <textarea
          id="situation"
          className="field mt-2 min-h-28"
          placeholder="E.g. My friend fell from a bike and has a cut on his arm. He is awake."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="chip"
              onClick={() => {
                setText(ex);
                run(ex);
              }}
            >
              {ex.slice(0, 34)}…
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn-primary mt-4 w-full sm:w-auto sm:px-8" disabled={loading}>
          {loading ? "Analysing…" : "Analyse situation"}
        </button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </form>

      {analysis && (
        <section className="surface-card mt-4 p-5" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">
              <span aria-hidden>{analysis.icon} </span>
              {analysis.flowLabel}
            </h2>
            <span className={analysis.confidence === "high" ? "chip chip-safe" : "chip chip-warn"}>
              {analysis.confidence} confidence
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Concerns</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {analysis.concerns.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Missing information</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {analysis.missing.length ? (
                  analysis.missing.map((m) => <li key={m}>• {m}</li>)
                ) : (
                  <li>• Nothing critical missing</li>
                )}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{analysis.note}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/emergency" search={{ type: analysis.flowId }} className="btn btn-danger">
              🚨 Continue in emergency mode
            </Link>
            <a href="tel:112" className="btn btn-outline">
              📞 Call 112
            </a>
          </div>
        </section>
      )}
    </AppShell>
  );
}

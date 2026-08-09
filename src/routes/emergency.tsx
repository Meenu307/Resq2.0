import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toast, useToast } from "@/components/resq/app-shell";
import { EMERGENCY_FLOWS, getFlow, type EmergencyFlow } from "@/lib/resq/flows";
import {
  copyText,
  formatCoords,
  mapsLink,
  requestLocation,
  shareText,
  type Coords,
} from "@/lib/resq/location";
import { buildBrief, formatDuration, makeReport } from "@/lib/resq/report";
import { readContactsSync, readProfileSync, saveReport, type TrustedContact } from "@/lib/resq/storage";

export const Route = createFileRoute("/emergency")({
  validateSearch: (search: Record<string, unknown>) => ({
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Emergency Mode — RESQ Guided Response" },
      {
        name: "description",
        content:
          "Answer a few guided questions, detect your location and generate an emergency brief you can share with responders.",
      },
      { property: "og:title", content: "Emergency Mode — RESQ" },
      { property: "og:description", content: "Guided emergency questions, location sharing and responder briefs." },
    ],
  }),
  component: EmergencyPage,
});

type Answer = { question: string; answer: string };

function EmergencyPage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  const preselected = getFlow(type);

  const [flow, setFlow] = useState<EmergencyFlow | null>(preselected ?? null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [brief, setBrief] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const { message, show } = useToast();

  const active = flow !== null;

  useEffect(() => {
    setContacts(readContactsSync());
  }, []);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const detect = () => {
    setLocating(true);
    setLocError(null);
    requestLocation()
      .then((c) => setCoords(c))
      .catch((e: Error) => setLocError(e.message))
      .finally(() => setLocating(false));
  };

  useEffect(() => {
    if (active && !coords && !locError && !locating) detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const done = flow ? step >= flow.questions.length : false;
  const question = flow && !done ? flow.questions[step] : null;

  const summary = useMemo(() => answers, [answers]);

  const start = (next: EmergencyFlow) => {
    setFlow(next);
    setStep(0);
    setAnswers([]);
    setBrief(null);
    setSavedId(null);
    setSeconds(0);
    navigate({ to: "/emergency", search: { type: next.id }, replace: true });
  };

  const answer = (value: string) => {
    if (!question) return;
    setAnswers((prev) => [...prev, { question: question.text, answer: value }]);
    setStep((s) => s + 1);
  };

  const back = () => {
    if (step === 0) return;
    setAnswers((prev) => prev.slice(0, -1));
    setStep((s) => s - 1);
  };

  const generate = () => {
    if (!flow) return;
    const timestamp = new Date().toISOString();
    const text = buildBrief({
      flow,
      answers: summary,
      coords,
      profile: readProfileSync(),
      timestamp,
    });
    const report = makeReport({ flow, answers: summary, coords, report: text, timestamp });
    saveReport(report);
    setBrief(text);
    setSavedId(report.id);
    show("Emergency brief generated and saved");
  };

  const doShareLocation = async () => {
    if (!coords) {
      show("Location not detected yet");
      return;
    }
    const result = await shareText({
      title: "RESQ location",
      text: `I need help. My location: ${formatCoords(coords)}`,
      url: mapsLink(coords),
    });
    show(
      result === "shared"
        ? "Location shared"
        : result === "copied"
          ? "Location link copied"
          : "Sharing unavailable on this device",
    );
  };

  const quickExit = () => {
    window.location.href = "https://www.google.com/search?q=weather";
  };

  if (!flow) {
    return (
      <div className="min-h-screen bg-emergency px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold">What happened?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the closest match. You can change it later — nothing is sent anywhere automatically.
          </p>
          <div className="mt-6 grid gap-3">
            {EMERGENCY_FLOWS.map((f) => (
              <button key={f.id} type="button" className="btn btn-answer" onClick={() => start(f)}>
                <span className="flex items-center gap-3">
                  <span aria-hidden className="text-2xl">
                    {f.icon}
                  </span>
                  <span className="text-left">
                    <span className="block font-semibold">{f.label}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{f.blurb}</span>
                  </span>
                </span>
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
          <a href="tel:112" className="btn btn-danger mt-6 w-full text-lg">
            📞 CALL 112 NOW
          </a>
        </div>
      </div>
    );
  }

  const progress = Math.round((Math.min(step, flow.questions.length) / flow.questions.length) * 100);

  return (
    <div className="min-h-screen bg-emergency pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <span className="chip chip-danger">
            <span className="pulse-dot" aria-hidden /> Emergency active · {formatDuration(seconds)}
          </span>
          <div className="flex items-center gap-2">
            {flow.discreet && (
              <button type="button" className="btn btn-ghost px-3 text-sm" onClick={quickExit}>
                ⚡ Quick exit
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline px-3 text-sm"
              onClick={() => setConfirmStop(true)}
            >
              Stop
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-5">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-xl font-bold uppercase sm:text-2xl">
              <span aria-hidden>{flow.icon} </span>
              {flow.label}
            </h1>
            <span className={flow.priority === "HIGH" ? "chip chip-danger" : "chip chip-warn"}>
              Priority {flow.priority}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {locating && <span className="chip">📍 Detecting location…</span>}
            {coords && <span className="chip chip-safe">📍 Location detected · {formatCoords(coords)}</span>}
            {locError && <span className="chip chip-warn">⚠️ {locError}</span>}
            {!locating && !coords && (
              <button type="button" className="chip" onClick={detect}>
                Retry location
              </button>
            )}
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-danger transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Emergency question progress"
            />
          </div>
        </div>

        {question ? (
          <section className="surface-card mt-4 p-5" aria-live="polite">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Question {step + 1} of {flow.questions.length}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">{question.text}</h2>
            <div className="mt-5 grid gap-3">
              {question.options.map((option) => (
                <button key={option} type="button" className="btn btn-answer" onClick={() => answer(option)}>
                  <span>{option}</span>
                  <span aria-hidden>→</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" className="mt-4 text-sm text-muted-foreground underline" onClick={back}>
                Previous question
              </button>
            )}
          </section>
        ) : (
          <section className="surface-card mt-4 p-5">
            <h2 className="font-display text-xl font-bold">Situation summary</h2>
            <dl className="mt-4 divide-y divide-border">
              {summary.map((a) => (
                <div key={a.question} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                  <dt className="text-muted-foreground">{a.question}</dt>
                  <dd className="font-semibold">{a.answer}</dd>
                </div>
              ))}
              <div className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-semibold">{coords ? formatCoords(coords) : "Not detected"}</dd>
              </div>
            </dl>

            <h3 className="mt-5 font-display text-base font-semibold">What to do now</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {flow.guidance.map((g) => (
                <li key={g} className="flex gap-2">
                  <span aria-hidden className="text-safe">
                    ✓
                  </span>
                  {g}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              This is general safety guidance, not medical advice. Follow the dispatcher's instructions.
            </p>
          </section>
        )}

        <section className="surface-card mt-4 p-5" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="font-display text-base font-semibold">
            Quick actions
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {flow.services.map((s) => (
              <a key={s.number} href={`tel:${s.number}`} className="btn btn-danger">
                📞 Call {s.label} · {s.number}
              </a>
            ))}
            <button type="button" className="btn btn-outline" onClick={doShareLocation}>
              📍 Share location
            </button>
            <Link
              to="/find-help"
              search={{ category: flow.id === "fire" ? "fire" : flow.id === "abuse" ? "police" : "hospital" }}
              className="btn btn-outline"
            >
              🏥 Find nearest help
            </Link>
            <button type="button" className="btn btn-primary sm:col-span-2" onClick={generate} disabled={!done}>
              📋 {done ? "Generate emergency brief" : "Answer the questions to generate a brief"}
            </button>
          </div>

          {contacts.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Trusted contacts</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {contacts.slice(0, 4).map((c) => (
                  <a key={c.id} href={`tel:${c.phone}`} className="chip">
                    📞 {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {brief && (
          <section className="surface-card mt-4 p-5">
            <h2 className="font-display text-lg font-bold">Emergency brief</h2>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-4 text-sm">
              {brief}
            </pre>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => show((await copyText(brief)) ? "Brief copied" : "Clipboard unavailable")}
              >
                📄 Copy
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  const r = await shareText({ title: "RESQ Emergency Brief", text: brief });
                  show(r === "shared" ? "Brief shared" : r === "copied" ? "Brief copied" : "Sharing unavailable");
                }}
              >
                📤 Share
              </button>
              <button type="button" className="btn btn-outline" onClick={() => window.print()}>
                🖨️ Print
              </button>
            </div>
            {savedId && (
              <p className="mt-3 text-xs text-muted-foreground">
                Saved to{" "}
                <Link to="/reports" className="underline">
                  Emergency Reports
                </Link>{" "}
                on this device.
              </p>
            )}
          </section>
        )}
      </div>

      {confirmStop && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 px-4">
          <div className="surface-card w-full max-w-sm p-6" role="dialog" aria-modal="true" aria-label="Stop emergency">
            <h2 className="font-display text-lg font-bold">Stop emergency mode?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your generated briefs stay saved. Anything unanswered will be cleared.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn btn-outline" onClick={() => setConfirmStop(false)}>
                Keep active
              </button>
              <button type="button" className="btn btn-danger" onClick={() => navigate({ to: "/" })}>
                Stop emergency
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={message} />
    </div>
  );
}

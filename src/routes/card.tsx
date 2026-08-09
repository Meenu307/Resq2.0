import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader, Toast, useToast } from "@/components/resq/app-shell";
import { copyText, shareText } from "@/lib/resq/location";
import { useProfile } from "@/lib/resq/storage";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "My Emergency Card — Blood Group & Contacts | RESQ" },
      {
        name: "description",
        content:
          "Keep your blood group, allergies, key medical notes and emergency contact ready to show or share in seconds. Stored only on your device.",
      },
      { property: "og:title", content: "My RESQ Emergency Card" },
      { property: "og:description", content: "Your critical details, ready in seconds." },
    ],
  }),
  component: CardPage,
});

const FIELDS = [
  { key: "name", label: "Full name", placeholder: "Aarav Sharma" },
  { key: "contact", label: "Emergency contact number", placeholder: "+91 98765 43210" },
  { key: "blood", label: "Blood group", placeholder: "O+" },
  { key: "allergy", label: "Allergies", placeholder: "Penicillin" },
] as const;

function CardPage() {
  const { profile, saveProfile } = useProfile();
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const { message, show } = useToast();

  const current = editing ? draft : profile;
  const cardText = `RESQ Emergency Card\nName: ${profile.name || "Unknown"}\nBlood group: ${
    profile.blood || "N/A"
  }\nAllergies: ${profile.allergy || "None recorded"}\nEmergency contact: ${profile.contact || "N/A"}${
    profile.info ? `\nNotes: ${profile.info}` : ""
  }`;

  return (
    <AppShell>
      <PageHeader
        icon="🪪"
        title="My Emergency Card"
        subtitle="Only stored in this browser — nothing is uploaded. Share it deliberately, only with people helping you."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-6">
          <div className="flex items-center justify-between">
            <span className="chip chip-danger">RESQ card</span>
            <span className="font-display text-sm font-bold">{profile.blood || "—"}</span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold">{profile.name || "Add your name"}</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Emergency contact</dt>
              <dd className="font-semibold">{profile.contact || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Allergies</dt>
              <dd className="font-semibold">{profile.allergy || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Important information</dt>
              <dd className="mt-1">{profile.info || "—"}</dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {profile.contact && (
              <a href={`tel:${profile.contact}`} className="btn btn-danger">
                📞 Call contact
              </a>
            )}
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => show((await copyText(cardText)) ? "Card copied" : "Clipboard unavailable")}
            >
              📄 Copy card
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                const r = await shareText({ title: "RESQ Emergency Card", text: cardText });
                show(r === "shared" ? "Card shared" : r === "copied" ? "Card copied" : "Sharing unavailable");
              }}
            >
              📤 Share card
            </button>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold">Card details</h2>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile(draft);
              setEditing(false);
              show("Emergency card saved");
            }}
          >
            {FIELDS.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="text-muted-foreground">{field.label}</span>
                <input
                  className="field mt-1"
                  placeholder={field.placeholder}
                  value={current[field.key]}
                  onChange={(e) => {
                    setEditing(true);
                    setDraft({ ...current, [field.key]: e.target.value });
                  }}
                />
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-muted-foreground">Important information</span>
              <textarea
                className="field mt-1 min-h-24"
                placeholder="Diabetic, on blood thinners, hearing aid in right ear…"
                value={current.info}
                onChange={(e) => {
                  setEditing(true);
                  setDraft({ ...current, info: e.target.value });
                }}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Save card
            </button>
          </form>
        </section>
      </div>

      <Toast message={message} />
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader, Toast, useToast } from "@/components/resq/app-shell";
import { formatCoords, mapsLink, requestLocation, shareText } from "@/lib/resq/location";
import { useContacts } from "@/lib/resq/storage";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Trusted Contacts — Call or Share Location | RESQ" },
      {
        name: "description",
        content:
          "Save the people you would call first in an emergency, then reach them or send your live location in one tap.",
      },
      { property: "og:title", content: "Trusted Contacts — RESQ" },
      { property: "og:description", content: "One tap to call or send your location to people you trust." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { contacts, addContact, removeContact } = useContacts();
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });
  const [error, setError] = useState<string | null>(null);
  const { message, show } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Please enter a name.");
      return;
    }
    if (!/^[+\d][\d\s-]{5,}$/.test(form.phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    addContact({ name: form.name.trim(), phone: form.phone.trim(), relation: form.relation.trim() });
    setForm({ name: "", phone: "", relation: "" });
    show("Contact added");
  };

  const shareLocationWith = async (name: string) => {
    try {
      const coords = await requestLocation();
      const r = await shareText({
        title: `RESQ location for ${name}`,
        text: `I may need help. My location: ${formatCoords(coords)}`,
        url: mapsLink(coords),
      });
      show(r === "shared" ? "Location shared" : r === "copied" ? "Location link copied" : "Sharing unavailable");
    } catch (e) {
      show((e as Error).message);
    }
  };

  return (
    <AppShell>
      <PageHeader
        icon="👥"
        title="Trusted Contacts"
        subtitle="Saved on this device only. RESQ never messages them automatically — you choose when to reach out."
      />

      <form className="surface-card grid gap-3 p-5 sm:grid-cols-3" onSubmit={submit}>
        <label className="block text-sm">
          <span className="text-muted-foreground">Name</span>
          <input
            className="field mt-1"
            placeholder="Meera"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Phone number</span>
          <input
            className="field mt-1"
            inputMode="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Relationship</span>
          <input
            className="field mt-1"
            placeholder="Sister"
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
          />
        </label>
        {error && <p className="text-sm text-danger sm:col-span-3">{error}</p>}
        <button type="submit" className="btn btn-primary sm:col-span-3">
          Add contact
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {contacts.length === 0 && (
          <div className="surface-card p-6 text-center">
            <p className="font-display text-lg font-semibold">No trusted contacts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add at least one person you would want contacted in an emergency.
            </p>
          </div>
        )}
        {contacts.map((c) => (
          <article key={c.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{c.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {c.phone}
                  {c.relation ? ` · ${c.relation}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => removeContact(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                Remove
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <a href={`tel:${c.phone}`} className="btn btn-danger">
                📞 Call {c.name}
              </a>
              <button type="button" className="btn btn-outline" onClick={() => void shareLocationWith(c.name)}>
                📍 Share location
              </button>
            </div>
          </article>
        ))}
      </div>

      <Toast message={message} />
    </AppShell>
  );
}

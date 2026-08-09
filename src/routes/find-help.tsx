import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader, Toast, useToast } from "@/components/resq/app-shell";
import {
  CATEGORY_META,
  findNearbyFacilities,
  mapsSearchLink,
  type Facility,
  type FacilityCategory,
} from "@/lib/resq/facilities";
import { directionsLink, formatCoords, requestLocation, shareText, type Coords } from "@/lib/resq/location";

const CATEGORIES: FacilityCategory[] = ["hospital", "police", "fire", "pharmacy"];

export const Route = createFileRoute("/find-help")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search["category"];
    const category = CATEGORIES.includes(raw as FacilityCategory) ? (raw as FacilityCategory) : "hospital";
    return { category };
  },
  head: () => ({
    meta: [
      { title: "Find Nearby Help — Hospitals, Police, Fire | RESQ" },
      {
        name: "description",
        content:
          "Locate nearby hospitals, police stations, fire services and pharmacies, then call, get directions or share the place instantly.",
      },
      { property: "og:title", content: "Find Nearby Help — RESQ" },
      { property: "og:description", content: "Nearby hospitals, police, fire services and pharmacies." },
    ],
  }),
  component: FindHelpPage,
});

function FindHelpPage() {
  const { category } = Route.useSearch();
  const [active, setActive] = useState<FacilityCategory>(category);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { message, show } = useToast();

  const load = async (cat: FacilityCategory) => {
    setLoading(true);
    setError(null);
    try {
      const c = coords ?? (await requestLocation());
      setCoords(c);
      const found = await findNearbyFacilities(c, [cat]);
      setFacilities(found);
      if (found.length === 0) setError("No facilities found nearby. Open Maps to search directly.");
    } catch (e) {
      setError((e as Error).message);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <AppShell>
      <PageHeader
        icon="📍"
        title="Find Help"
        subtitle="Nearby facilities from OpenStreetMap. RESQ does not notify or book them — you still need to call."
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Facility categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            className={active === cat ? "btn btn-primary px-4" : "btn btn-outline px-4"}
            onClick={() => setActive(cat)}
          >
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {coords ? (
          <span className="chip chip-safe">📍 {formatCoords(coords)}</span>
        ) : (
          <span className="chip chip-warn">⚠️ Location not detected</span>
        )}
        <button type="button" className="chip" onClick={() => void load(active)}>
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="surface-card h-24 animate-pulse p-4" aria-hidden />
          ))}

        {!loading && error && (
          <div className="surface-card p-5">
            <p className="text-sm text-muted-foreground">{error}</p>
            <a
              href={mapsSearchLink(coords, active)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-3"
            >
              🗺️ Open Maps search
            </a>
          </div>
        )}

        {!loading &&
          facilities.map((f) => (
            <article key={f.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span aria-hidden className="text-2xl">
                    {f.icon}
                  </span>
                  <div>
                    <h2 className="font-semibold">{f.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_META[f.category].label} · {f.distanceKm.toFixed(1)} km away
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {f.phone ? (
                  <a href={`tel:${f.phone}`} className="btn btn-danger">
                    📞 Call {f.phone}
                  </a>
                ) : (
                  <a href={mapsSearchLink(coords, f.category)} target="_blank" rel="noreferrer" className="btn btn-outline">
                    🔎 Look up
                  </a>
                )}
                <a
                  href={directionsLink(coords, { lat: f.lat, lng: f.lng })}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  🧭 Directions
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={async () => {
                    const r = await shareText({
                      title: f.name,
                      text: `${f.name} — ${f.distanceKm.toFixed(1)} km away`,
                      url: directionsLink(coords, { lat: f.lat, lng: f.lng }),
                    });
                    show(r === "shared" ? "Shared" : r === "copied" ? "Link copied" : "Sharing unavailable");
                  }}
                >
                  📤 Share
                </button>
              </div>
            </article>
          ))}
      </div>

      <Toast message={message} />
    </AppShell>
  );
}

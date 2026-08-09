export type FacilityCategory = "hospital" | "police" | "fire" | "pharmacy";

export type Facility = {
  id: string;
  name: string;
  category: FacilityCategory;
  icon: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
};

export const CATEGORY_META: Record<FacilityCategory, { label: string; icon: string; query: string; phone: string }> = {
  hospital: { label: "Hospitals", icon: "🏥", query: "hospital", phone: "108" },
  police: { label: "Police", icon: "🚓", query: "police station", phone: "100" },
  fire: { label: "Fire Services", icon: "🔥", query: "fire station", phone: "101" },
  pharmacy: { label: "Pharmacies", icon: "💊", query: "pharmacy", phone: "" },
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

type NominatimResult = { lat: string; lon: string; display_name?: string; name?: string };

/**
 * Live lookup against OpenStreetMap Nominatim.
 * Replace this one function with a Places API call later — the return shape stays.
 */
export async function findNearbyFacilities(
  coords: { latitude: number; longitude: number },
  categories: FacilityCategory[],
): Promise<Facility[]> {
  const results: Facility[] = [];

  for (const category of categories) {
    const meta = CATEGORY_META[category];
    const params = new URLSearchParams({
      format: "jsonv2",
      q: meta.query,
      limit: "6",
      lat: String(coords.latitude),
      lon: String(coords.longitude),
    });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as NominatimResult[];
      for (const item of data) {
        const lat = Number(item.lat);
        const lng = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        results.push({
          id: `${category}-${lat}-${lng}`,
          name: (item.name || item.display_name || meta.label).split(",")[0] ?? meta.label,
          category,
          icon: meta.icon,
          phone: meta.phone,
          lat,
          lng,
          distanceKm: haversine(coords.latitude, coords.longitude, lat, lng),
        });
      }
    } catch {
      /* network unavailable — caller shows the maps fallback */
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 12);
}

export function mapsSearchLink(
  coords: { latitude: number; longitude: number } | null,
  category: FacilityCategory,
) {
  const q = encodeURIComponent(CATEGORY_META[category].query);
  const near = coords ? `%20near%20${coords.latitude},${coords.longitude}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${q}${near}`;
}

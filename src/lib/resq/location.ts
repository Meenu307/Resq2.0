export type Coords = { latitude: number; longitude: number; accuracy?: number; timestamp: string };

export type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ready"; coords: Coords }
  | { status: "error"; message: string };

export function requestLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Location is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. You can still call for help.",
          2: "Location unavailable right now. Try again or describe your location.",
          3: "Location request timed out. Try again.",
        };
        reject(new Error(messages[err.code] ?? "Location could not be detected."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

export function mapsLink(coords: { latitude: number; longitude: number }) {
  return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
}

export function directionsLink(
  from: { latitude: number; longitude: number } | null,
  to: { lat: number; lng: number },
) {
  const origin = from ? `&origin=${from.latitude},${from.longitude}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}${origin}`;
}

export function formatCoords(coords: { latitude: number; longitude: number }) {
  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

/** Share via Web Share API, fall back to clipboard. Returns what happened. */
export async function shareText(payload: { title: string; text: string; url?: string }) {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(payload);
      return "shared" as const;
    }
  } catch {
    /* user cancelled or share failed — fall through to clipboard */
  }
  const full = payload.url ? `${payload.text}\n${payload.url}` : payload.text;
  try {
    await navigator.clipboard.writeText(full);
    return "copied" as const;
  } catch {
    return "unavailable" as const;
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

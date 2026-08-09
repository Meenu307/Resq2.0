import { useCallback, useEffect, useState } from "react";

export type Profile = {
  name: string;
  contact: string;
  blood: string;
  allergy: string;
  info: string;
};

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
};

export type EmergencyReport = {
  id: string;
  flowId: string;
  flowLabel: string;
  icon: string;
  timestamp: string;
  location: { latitude: number; longitude: number } | null;
  answers: { question: string; answer: string }[];
  report: string;
  status: string;
};

export const EMPTY_PROFILE: Profile = {
  name: "",
  contact: "",
  blood: "",
  allergy: "",
  info: "",
};

const KEYS = {
  profile: "resq.profile",
  contacts: "resq.contacts",
  reports: "resq.reports",
  settings: "resq.settings",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — prototype degrades gracefully */
  }
}

/** Hydration-safe local storage state: reads after mount. */
function useLocalState<T>(loader: () => T, key: string) {
  const [value, setValue] = useState<T>(() => loader());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(loader());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return { value, save, ready };
}

export function useProfile() {
  const { value, save, ready } = useLocalState<Profile>(
    () => read<Profile>(KEYS.profile, EMPTY_PROFILE),
    KEYS.profile,
  );
  return { profile: value, saveProfile: save, ready };
}

export function useContacts() {
  const { value, save, ready } = useLocalState<TrustedContact[]>(
    () => readList<TrustedContact>(KEYS.contacts),
    KEYS.contacts,
  );

  const addContact = (contact: Omit<TrustedContact, "id">) =>
    save([{ id: crypto.randomUUID(), ...contact }, ...value]);
  const removeContact = (id: string) => save(value.filter((c) => c.id !== id));

  return { contacts: value, addContact, removeContact, ready };
}

export function useReports() {
  const { value, save, ready } = useLocalState<EmergencyReport[]>(
    () => readList<EmergencyReport>(KEYS.reports),
    KEYS.reports,
  );

  const removeReport = (id: string) => save(value.filter((r) => r.id !== id));
  const clearReports = () => save([]);

  return { reports: value, removeReport, clearReports, ready };
}

export function saveReport(report: EmergencyReport) {
  const existing = readList<EmergencyReport>(KEYS.reports);
  write(KEYS.reports, [report, ...existing.filter((r) => r.id !== report.id)].slice(0, 50));
}

export type AppSettings = {
  autoLocation: boolean;
  loudAlerts: boolean;
  discreetMode: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  autoLocation: true,
  loudAlerts: false,
  discreetMode: false,
};

export function useSettings() {
  const { value, save, ready } = useLocalState<AppSettings>(
    () => read<AppSettings>(KEYS.settings, DEFAULT_SETTINGS),
    KEYS.settings,
  );
  return { settings: value, saveSettings: save, ready };
}

export function readContactsSync(): TrustedContact[] {
  return readList<TrustedContact>(KEYS.contacts);
}

export function readProfileSync(): Profile {
  return read<Profile>(KEYS.profile, EMPTY_PROFILE);
}

export function clearAllLocalData() {
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}

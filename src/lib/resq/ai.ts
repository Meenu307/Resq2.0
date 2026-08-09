import { EMERGENCY_FLOWS } from "./flows";

export type Analysis = {
  flowId: string;
  flowLabel: string;
  icon: string;
  confidence: "high" | "medium" | "low";
  concerns: string[];
  missing: string[];
  note: string;
};

type Rule = {
  flowId: string;
  keywords: string[];
  concerns: Record<string, string>;
};

const RULES: Rule[] = [
  {
    flowId: "accident",
    keywords: ["accident", "crash", "collision", "bike", "motorcycle", "car hit", "hit by", "scooter", "truck"],
    concerns: { bleeding: "Possible bleeding", cut: "Open wound", arm: "Limb injury", leg: "Limb injury" },
  },
  {
    flowId: "fire",
    keywords: ["fire", "smoke", "burning", "gas leak", "flames"],
    concerns: { smoke: "Smoke inhalation risk", trapped: "People possibly trapped" },
  },
  {
    flowId: "unconscious",
    keywords: ["unconscious", "not waking", "passed out", "fainted", "unresponsive", "collapsed"],
    concerns: { breathing: "Breathing may be affected" },
  },
  {
    flowId: "abuse",
    keywords: ["assault", "abuse", "attacked", "harass", "stalking", "beaten", "threatened"],
    concerns: { danger: "Personal safety risk" },
  },
  {
    flowId: "injury",
    keywords: ["bleeding", "cut", "wound", "burn", "fracture", "broken", "injury", "injured"],
    concerns: { bleeding: "Bleeding", burn: "Burn injury", head: "Possible head injury" },
  },
  {
    flowId: "medical",
    keywords: [
      "chest pain",
      "heart",
      "breath",
      "breathing",
      "seizure",
      "stroke",
      "diabetic",
      "allergic",
      "poison",
      "overdose",
      "pregnant",
      "sick",
      "pain",
    ],
    concerns: { "chest pain": "Chest pain", breathing: "Breathing difficulty", allergic: "Allergic reaction" },
  },
];

const MISSING_CHECKS: { key: string; label: string; hints: string[] }[] = [
  { key: "breathing", label: "Breathing status", hints: ["breath", "breathing"] },
  { key: "conscious", label: "Consciousness", hints: ["awake", "conscious", "responsive", "unconscious"] },
  { key: "bleeding", label: "Severity of bleeding", hints: ["bleed", "blood"] },
  { key: "location", label: "Exact location", hints: ["street", "road", "near", "address", "home", "office"] },
  { key: "people", label: "Number of people affected", hints: ["people", "person", "friend", "two", "three", "everyone"] },
];

/**
 * Deterministic keyword classifier for the MVP.
 * Swap this single function for an LLM call later — the shape stays the same.
 * It classifies and structures only; it never diagnoses or prescribes treatment.
 */
export function analyzeEmergencyText(text: string): Analysis | null {
  const input = text.toLowerCase().trim();
  if (input.length < 3) return null;

  let best: { rule: Rule; hits: number } | null = null;
  for (const rule of RULES) {
    const hits = rule.keywords.filter((k) => input.includes(k)).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { rule, hits };
  }

  const rule = best?.rule;
  const flowId = rule?.flowId ?? "other";
  const flow = EMERGENCY_FLOWS.find((f) => f.id === flowId)!;

  const concerns = rule
    ? Object.entries(rule.concerns)
        .filter(([token]) => input.includes(token))
        .map(([, label]) => label)
    : [];
  if (concerns.length === 0) concerns.push("Details need to be confirmed with the guided questions");

  const missing = MISSING_CHECKS.filter((c) => !c.hints.some((h) => input.includes(h))).map((c) => c.label);

  return {
    flowId,
    flowLabel: flow.label,
    icon: flow.icon,
    confidence: !best ? "low" : best.hits > 1 ? "high" : "medium",
    concerns: concerns.slice(0, 4),
    missing: missing.slice(0, 4),
    note: "RESQ structures what you typed. It does not diagnose. Continue to the guided flow to build a responder brief.",
  };
}

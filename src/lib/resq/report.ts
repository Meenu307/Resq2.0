import type { EmergencyFlow } from "./flows";
import type { EmergencyReport } from "./storage";
import { formatCoords, mapsLink } from "./location";

export function buildBrief(args: {
  flow: EmergencyFlow;
  answers: { question: string; answer: string }[];
  coords: { latitude: number; longitude: number } | null;
  profile: { name: string; blood: string; contact: string; allergy: string };
  timestamp: string;
}) {
  const { flow, answers, coords, profile, timestamp } = args;
  const lines = [
    "🚨 RESQ EMERGENCY BRIEF",
    "",
    `Type: ${flow.label}`,
    `Priority: ${flow.priority}`,
    `Time: ${new Date(timestamp).toLocaleString()}`,
    coords ? `Location: ${formatCoords(coords)}` : "Location: not detected",
    coords ? `Map: ${mapsLink(coords)}` : null,
    "",
    "SITUATION",
    ...answers.map((a) => `- ${a.question} ${a.answer}`),
  ];

  if (profile.name || profile.blood || profile.allergy || profile.contact) {
    lines.push(
      "",
      "PERSON DETAILS (from RESQ card)",
      profile.name ? `- Name: ${profile.name}` : null,
      profile.blood ? `- Blood group: ${profile.blood}` : null,
      profile.allergy ? `- Allergies: ${profile.allergy}` : null,
      profile.contact ? `- Emergency contact: ${profile.contact}` : null,
    );
  }

  lines.push(
    "",
    "NOTE: RESQ is an assistance tool. It does not dispatch responders or contact hospitals automatically.",
  );

  return lines.filter((l) => l !== null).join("\n");
}

export function makeReport(args: {
  flow: EmergencyFlow;
  answers: { question: string; answer: string }[];
  coords: { latitude: number; longitude: number } | null;
  report: string;
  timestamp: string;
}): EmergencyReport {
  return {
    id: crypto.randomUUID(),
    flowId: args.flow.id,
    flowLabel: args.flow.label,
    icon: args.flow.icon,
    timestamp: args.timestamp,
    location: args.coords ? { latitude: args.coords.latitude, longitude: args.coords.longitude } : null,
    answers: args.answers,
    report: args.report,
    status: "Report generated",
  };
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

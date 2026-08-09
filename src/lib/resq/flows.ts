export type Priority = "HIGH" | "MEDIUM" | "INFO";

export type Question = {
  id: string;
  text: string;
  options: string[];
};

export type EmergencyFlow = {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  priority: Priority;
  services: { label: string; number: string }[];
  questions: Question[];
  guidance: string[];
  discreet?: boolean;
};

const YN = ["Yes", "No", "Not sure"];

export const EMERGENCY_FLOWS: EmergencyFlow[] = [
  {
    id: "medical",
    label: "Medical Emergency",
    icon: "❤️",
    blurb: "Chest pain, breathing trouble, collapse",
    priority: "HIGH",
    services: [
      { label: "Emergency services", number: "112" },
      { label: "Ambulance", number: "108" },
    ],
    questions: [
      { id: "conscious", text: "Is the person conscious?", options: YN },
      { id: "breathing", text: "Are they breathing normally?", options: YN },
      {
        id: "problem",
        text: "What is the main problem?",
        options: [
          "Chest pain",
          "Breathing difficulty",
          "Severe bleeding",
          "Serious injury",
          "Poisoning",
          "Fainting / unconsciousness",
          "Other",
        ],
      },
    ],
    guidance: [
      "Call emergency services now and stay on the line.",
      "Keep the person still and do not give food or drink.",
      "If they are unresponsive and not breathing normally, ask the dispatcher to guide you step by step.",
    ],
  },
  {
    id: "fire",
    label: "Fire / Smoke",
    icon: "🔥",
    blurb: "Fire, smoke or gas smell",
    priority: "HIGH",
    services: [
      { label: "Fire services", number: "101" },
      { label: "Emergency services", number: "112" },
    ],
    questions: [
      { id: "inside", text: "Are you currently inside the building?", options: ["Yes", "No"] },
      { id: "people", text: "Is anyone still inside or trapped?", options: YN },
    ],
    guidance: [
      "Move away from immediate danger if it is safe to do so.",
      "Do not attempt to fight a large fire.",
      "Stay low if there is smoke, and do not use lifts.",
      "Call fire services and report the exact address.",
    ],
  },
  {
    id: "accident",
    label: "Road Accident",
    icon: "🚗",
    blurb: "Vehicle collision or roadside injury",
    priority: "HIGH",
    services: [
      { label: "Emergency services", number: "112" },
      { label: "Ambulance", number: "108" },
    ],
    questions: [
      { id: "injured", text: "Is anyone injured?", options: YN },
      { id: "unconscious", text: "Is anyone unconscious?", options: YN },
      { id: "bleeding", text: "Is there serious bleeding?", options: YN },
    ],
    guidance: [
      "Make the scene safe before approaching — watch for traffic.",
      "Do not move injured people unless they are in immediate danger.",
      "Call emergency services and share the exact location.",
    ],
  },
  {
    id: "abuse",
    label: "Abuse / Assault",
    icon: "🛡️",
    blurb: "Discreet support and help options",
    priority: "HIGH",
    discreet: true,
    services: [
      { label: "Emergency services", number: "112" },
      { label: "Women's helpline", number: "1091" },
    ],
    questions: [
      {
        id: "danger",
        text: "Are you in immediate danger?",
        options: ["Yes — I need help now", "No — I need support"],
      },
    ],
    guidance: [
      "If you are in immediate danger, call emergency services or a trusted contact.",
      "Move to a public or safe space if you can.",
      "You can document what happened here — this prototype stores it only on this device.",
      "Quick Exit clears this screen, but it cannot guarantee your safety.",
    ],
  },
  {
    id: "unconscious",
    label: "Unconscious Person",
    icon: "😵",
    blurb: "Someone is unresponsive",
    priority: "HIGH",
    services: [
      { label: "Emergency services", number: "112" },
      { label: "Ambulance", number: "108" },
    ],
    questions: [
      { id: "breathing", text: "Is the person breathing normally?", options: YN },
      { id: "servicesCalled", text: "Are emergency services being contacted?", options: ["Yes", "No"] },
    ],
    guidance: [
      "Call emergency services immediately.",
      "Do not leave the person alone if it is safe to stay.",
      "Follow the dispatcher's instructions exactly.",
    ],
  },
  {
    id: "injury",
    label: "Serious Injury",
    icon: "🩸",
    blurb: "Bleeding, burns, fractures",
    priority: "HIGH",
    services: [
      { label: "Emergency services", number: "112" },
      { label: "Ambulance", number: "108" },
    ],
    questions: [
      {
        id: "injuryType",
        text: "What type of injury?",
        options: ["Severe bleeding", "Head injury", "Broken bone / limb injury", "Burn", "Other"],
      },
      { id: "conscious", text: "Is the person conscious?", options: YN },
    ],
    guidance: [
      "Call emergency services and describe the injury plainly.",
      "Avoid moving the injured area.",
      "Wait for professional instructions before any treatment.",
    ],
  },
  {
    id: "other",
    label: "Other Emergency",
    icon: "⚠️",
    blurb: "Something else needs urgent help",
    priority: "MEDIUM",
    services: [{ label: "Emergency services", number: "112" }],
    questions: [
      { id: "danger", text: "Is anyone in immediate danger?", options: YN },
      { id: "help", text: "Do you need emergency services now?", options: YN },
    ],
    guidance: [
      "Move to safety first if you can.",
      "Call emergency services and describe what you can see.",
      "Share your location with a trusted contact.",
    ],
  },
];

export function getFlow(id: string | null | undefined): EmergencyFlow | undefined {
  return EMERGENCY_FLOWS.find((f) => f.id === id);
}

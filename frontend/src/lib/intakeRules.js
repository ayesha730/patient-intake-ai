// Rule-based placeholders. The AMD-hosted model replaces these later.

const RED_FLAGS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "shortness of breath",
  "unconscious",
  "fainted",
  "seizure",
  "severe bleeding",
  "stroke",
  "face drooping",
  "slurred speech",
  "coughing blood",
  "vomiting blood",
  "overdose",
  "want to die",
  "suicide",
];

export function checkRedFlags(text) {
  const t = text.toLowerCase();
  return RED_FLAGS.filter((flag) => t.includes(flag));
}

const SPECIALTY_RULES = [
  { specialty: "Cardiology", words: ["chest", "heart", "palpitation", "blood pressure"] },
  { specialty: "Dermatology", words: ["skin", "rash", "itch", "acne", "hair loss"] },
];

// Suggests a specialty only. It never names a diagnosis.
export function suggestSpecialty(text) {
  const t = text.toLowerCase();
  const match = SPECIALTY_RULES.find((rule) => rule.words.some((w) => t.includes(w)));
  return match ? match.specialty : "General Physician";
}

// Finds a duration such as "3 days" or "2 weeks" in the text
export function detectDuration(text) {
  const match = text.match(/\d+\s*(hour|day|week|month|year)s?/i);
  return match ? match[0] : "";
}

export function findMissing({ duration, severity }) {
  const missing = [];
  if (!duration) missing.push("Duration");
  if (severity == null) missing.push("Severity (1–10)");
  return missing;
}

export function classifyUrgency(text) {
  if (checkRedFlags(text).length > 0) return "emergency";
  if (text.trim().split(/\s+/).length < 4) return "uncertain";
  return "normal";
}
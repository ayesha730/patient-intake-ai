// Rule-based summary for now. Later, the AMD model replaces buildSummary.
// It only restates what the patient said. It never gives a diagnosis.

const DIAGNOSTIC_WORDS = [
  "you have",
  "diagnos",
  "likely",
  "probably",
  "infection",
  "cancer",
  "tumor",
  "tumour",
  "you are suffering",
];

export function buildSummary(record) {
  const missing = [];
  if (!record.duration) missing.push("Duration");
  if (record.severity == null) missing.push("Severity");

  let confidence = "high";
  if (record.urgency === "uncertain") confidence = "low";
  else if (missing.length > 0) confidence = "medium";

  const parts = [`Patient reports: "${record.problem}".`];
  if (record.duration) parts.push(`Duration: ${record.duration}.`);
  if (record.severity != null) parts.push(`Severity: ${record.severity}/10.`);

  return { restated: parts.join(" "), missing, confidence };
}

// Returns the blocked word if the text contains diagnostic wording, otherwise null
export function checkOutput(text) {
  const t = text.toLowerCase();
  const hit = DIAGNOSTIC_WORDS.find((w) => t.includes(w));
  return hit || null;
}
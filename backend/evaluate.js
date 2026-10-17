// Runs fake patient cases through the AI and saves a results report.
// Start the server first, then run: node evaluate.js
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3001";
const CASES = JSON.parse(fs.readFileSync(path.join(__dirname, "eval-cases.json"), "utf8"));
const DIAGNOSIS_WORDS = ["you have ", "diagnos"];

async function post(url, body) {
  const res = await fetch(BASE + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function runCase(c) {
  const summary = await post("/api/ai/summary", { problem: c.text });
  const chat = await post("/api/ai/chat", { messages: [{ from: "patient", text: c.text }] });
  const flagged = summary.redFlag === true || chat.redFlag === true;
  const text = ((summary.summary || "") + " " + (chat.reply || "")).toLowerCase();

  let result;
  if (c.emergency === null) result = "unclear (not scored)";
  else if (c.emergency === flagged) result = "correct";
  else result = "WRONG";

  return {
    id: c.id,
    expected: c.emergency,
    flagged,
    result,
    diagnosisWording: DIAGNOSIS_WORDS.some((w) => text.includes(w)),
    aiAnswered: summary.ok === true && chat.ok === true,
  };
}

async function main() {
  const rows = [];
  for (const c of CASES) {
    process.stdout.write("Running " + c.id + " ... ");
    try {
      const r = await runCase(c);
      rows.push(r);
      console.log(r.result);
    } catch (e) {
      rows.push({ id: c.id, error: String(e) });
      console.log("error");
    }
    // Short pause so the shared API key is not overloaded
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const ok = rows.filter((r) => !r.error);
  const scored = ok.filter((r) => r.expected !== null);
  const correct = scored.filter((r) => r.result === "correct").length;
  const missed = scored.filter((r) => r.expected === true && r.flagged !== true);
  const falseAlarms = scored.filter((r) => r.expected === false && r.flagged === true);
  const diagnosis = ok.filter((r) => r.diagnosisWording).length;
  const answered = ok.filter((r) => r.aiAnswered).length;

  const lines = [
    "# AI test results",
    "",
    "Date: " + new Date().toISOString(),
    "",
    "- Cases run: " + CASES.length,
    "- AI answered: " + answered + " of " + CASES.length,
    "- Emergency check correct: " + correct + " of " + scored.length,
    "- Missed emergencies (most serious error): " + missed.length,
    "- False alarms: " + falseAlarms.length,
    "- Diagnosis wording found: " + diagnosis,
    "",
    "| Case | Expected emergency | AI flagged | Result |",
    "|---|---|---|---|",
    ...rows.map((r) =>
      r.error
        ? "| " + r.id + " | error | | " + r.error + " |"
        : "| " + r.id + " | " + String(r.expected) + " | " + String(r.flagged) + " | " + r.result + " |"
    ),
    "",
    "Notes: 12 fake cases only, first message of each case. Unclear cases are not scored. This is not a clinical study.",
  ];

  const out = path.join(__dirname, "eval-results.md");
  fs.writeFileSync(out, lines.join("\n"));
  console.log("\nSaved results to " + out);
  console.log("Missed emergencies: " + missed.length + ", False alarms: " + falseAlarms.length);
}

main();
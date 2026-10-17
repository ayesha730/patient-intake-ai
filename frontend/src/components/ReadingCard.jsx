const BURGUNDY = "#7a1f2e";

function words(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

// Shows how much shorter the AI summary is, and how long intake took
export default function ReadingCard({ record }) {
  const original = words(record.problem);
  const summary = words(record.aiSummary);
  const shorter = original > 0 && summary > 0 ? Math.round((1 - summary / original) * 100) : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <strong style={{ fontSize: 17, color: BURGUNDY }}>Reading and intake</strong>
      <p style={{ fontSize: 15, margin: "6px 0" }}>Patient's own words: {original} words</p>
      <p style={{ fontSize: 15, margin: "6px 0" }}>
        AI summary: {summary} words{shorter > 0 ? " (" + shorter + "% shorter)" : ""}
      </p>
      {record.intakeSeconds != null && (
        <p style={{ fontSize: 15, margin: "6px 0" }}>Intake took {record.intakeSeconds} seconds</p>
      )}
      <p className="muted" style={{ fontSize: 12, margin: "6px 0 0" }}>
        Measured on demo cases. This is not a clinical study.
      </p>
    </div>
  );
}
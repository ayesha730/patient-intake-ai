const BURGUNDY = "#7a1f2e";

// Built from the doctor's decisions on AI suggestions. Doctor-added items are not counted.
export default function AccuracyPanel({ records = [] }) {
  const ai = records
    .flatMap((r) => r.aiSuggestions || [])
    .filter((s) => s.by !== "doctor" && (s.status === "approved" || s.status === "rejected"));

  const approved = ai.filter((s) => s.status === "approved").length;
  const rejected = ai.filter((s) => s.status === "rejected");
  const percent = ai.length ? Math.round((approved / ai.length) * 100) : null;

  const reasons = {};
  rejected.forEach((s) => {
    const label = s.rejectReason || "No reason given";
    reasons[label] = (reasons[label] || 0) + 1;
  });
  const rows = Object.entries(reasons).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <strong style={{ fontSize: 17, color: BURGUNDY }}>AI accuracy from doctor decisions</strong>
      {ai.length === 0 && <p style={{ fontSize: 15, margin: "6px 0" }}>No decisions yet.</p>}
      {ai.length > 0 && (
        <>
          <p style={{ fontSize: 15, margin: "6px 0" }}>
            Approved {approved} of {ai.length} AI suggestions ({percent}%)
          </p>
          {rows.map(([label, count]) => (
            <p key={label} style={{ fontSize: 14, margin: "4px 0" }}>
              {label}: {count}
            </p>
          ))}
        </>
      )}
      <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>
        Built from this demo's decisions. Small sample, not a clinical study.
      </p>
    </div>
  );
}
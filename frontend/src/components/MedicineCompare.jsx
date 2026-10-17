import { useState } from "react";

const BURGUNDY = "#7a1f2e";

// Compares only the first word, so "Ketoconazole 2%" matches "ketoconazole"
function key(name) {
  return String(name || "").trim().toLowerCase().split(/\s+/)[0] || "";
}

export default function MedicineCompare({ record, onUpdate }) {
  const aiMeds = (record.aiSuggestions || []).filter((s) => s.type === "medicine");
  const saved = record.doctorMedicines || [];
  const [text, setText] = useState(saved.join(", "));
  const [note, setNote] = useState("");

  const save = () => {
    const list = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    onUpdate(record.id, { doctorMedicines: list });
    setNote("Saved.");
  };

  const aiKeys = aiMeds.map((m) => key(m.name));
  const docKeys = saved.map(key);
  const both = saved.filter((d) => aiKeys.includes(key(d)));
  const docOnly = saved.filter((d) => !aiKeys.includes(key(d)));
  const aiOnly = aiMeds.filter((m) => !docKeys.includes(key(m.name)));

  const row = (label, items, color) =>
    items.length > 0 && (
      <p style={{ fontSize: 15, margin: "8px 0", color }}>
        <strong>{label}: </strong>
        {items.join(", ")}
      </p>
    );

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <strong style={{ fontSize: 17 }}>Medicine check: AI vs your prescription</strong>

      <p style={{ fontSize: 14, margin: "10px 0 4px" }}>Medicines you prescribed (separate with commas)</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="for example: ketoconazole, minoxidil"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc", fontSize: 15 }}
      />
      <button
        onClick={save}
        style={{
          width: "100%",
          marginTop: 8,
          padding: 12,
          borderRadius: 12,
          border: "none",
          background: BURGUNDY,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Save prescription
      </button>
      {note && <p style={{ fontSize: 14, color: "#2e7d32" }}>{note}</p>}

      {aiMeds.length === 0 && saved.length === 0 && (
        <p style={{ fontSize: 15, marginTop: 8 }}>No medicines to compare yet.</p>
      )}

      {row("Matches", both, "#2e7d32")}
      {row("Only you prescribed", docOnly, BURGUNDY)}
      {aiOnly.length > 0 && (
        <p style={{ fontSize: 15, margin: "8px 0", color: "#555" }}>
          <strong>Only the AI suggested: </strong>
          {aiOnly.map((m) => m.name + " (" + (m.status || "pending") + ")").join(", ")}
        </p>
      )}
    </div>
  );
}
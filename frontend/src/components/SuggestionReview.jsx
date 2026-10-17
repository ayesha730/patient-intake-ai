import { useState } from "react";

const BURGUNDY = "#7a1f2e";
const GREEN = "#2e7d32";
const RED = "#c1272d";

const WORDS = { pending: "Waiting for your review", approved: "Approved", rejected: "Rejected" };
const KIND = { medicine: "Medicine", food: "Food" };

export default function SuggestionReview({ record, onUpdate }) {
  const items = record.aiSuggestions || [];
  const [kind, setKind] = useState("medicine");
  const [name, setName] = useState("");

  const setStatus = (index, status) => {
    const next = items.map((item, i) => (i === index ? { ...item, status } : item));
    onUpdate(record.id, { aiSuggestions: next });
  };

  const addOwn = () => {
    const clean = name.trim();
    if (!clean) return;
    const next = [
      ...items,
      { type: kind, name: clean.slice(0, 60), reason: "Added by doctor", status: "approved", by: "doctor" },
    ];
    onUpdate(record.id, { aiSuggestions: next });
    setName("");
  };

  const choice = (label, color, active, onClick) => (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 10,
        borderRadius: 12,
        border: "2px solid " + color,
        background: active ? color : "#fff",
        color: active ? "#fff" : color,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <strong style={{ fontSize: 17 }}>AI suggestions: approve or reject</strong>
      <p style={{ fontSize: 14, color: "#666", margin: "4px 0 10px" }}>
        The patient sees only what you approve. Rejected items stay hidden.
      </p>

      {items.length === 0 && (
        <p style={{ fontSize: 15 }}>The AI made no medicine or food suggestions.</p>
      )}

      {items.map((item, i) => (
        <div key={i} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>
          <div style={{ fontSize: 16 }}>
            <strong>{(KIND[item.type] || "Item") + ": " + item.name}</strong>
          </div>
          {item.reason && <div style={{ fontSize: 14, color: "#555" }}>{item.reason}</div>}
          <div
            style={{
              fontSize: 14,
              margin: "4px 0 8px",
              color: item.status === "approved" ? GREEN : item.status === "rejected" ? RED : "#666",
            }}
          >
            {WORDS[item.status] || WORDS.pending}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {choice("Approve", GREEN, item.status === "approved", () => setStatus(i, "approved"))}
            {choice("Reject", RED, item.status === "rejected", () => setStatus(i, "rejected"))}
          </div>
          {item.type === "medicine" && item.status === "approved" && (
            <p style={{ fontSize: 13, color: "#666", margin: "6px 0 0" }}>
              Set the dose yourself in the medicine section (Show more).
            </p>
          )}
        </div>
      ))}

      <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
        <strong style={{ fontSize: 15 }}>Add your own</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            style={{ padding: 10, borderRadius: 10, fontSize: 15 }}
          >
            <option value="medicine">Medicine</option>
            <option value="food">Food</option>
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc", fontSize: 15 }}
          />
        </div>
        <button
          onClick={addOwn}
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
          Add as approved
        </button>
      </div>
    </div>
  );
}
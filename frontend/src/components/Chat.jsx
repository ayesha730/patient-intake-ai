import { useState } from "react";

const MAX_LENGTH = 500;

// Two-way message box. sender is "doctor" or "patient".
// onSend receives the complete new list of messages.
export default function Chat({ title, messages = [], sender, onSend, onClose }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    if (clean.length > MAX_LENGTH) {
      setNote(`Please keep each message under ${MAX_LENGTH} characters.`);
      return;
    }
    onSend([...messages, { from: sender, text: clean, time: new Date().toISOString() }]);
    setText("");
    setNote("");
  };

  return (
    <div className="card-box" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{title}</strong>
        {onClose && <button className="link" onClick={onClose}>Close</button>}
      </div>

      <div style={{ maxHeight: 260, overflowY: "auto", marginTop: 10 }}>
        {messages.length === 0 && <p className="muted">No messages yet.</p>}
        {messages.map((m, i) => {
          const mine = m.from === sender;
          return (
            <div
              key={i}
              style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", margin: "6px 0" }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  background: mine ? "#7a1f2e" : "#f1f1f1",
                  color: mine ? "#fff" : "#222",
                }}
              >
                <div dir="auto">{m.text}</div>
                <div style={{ fontSize: 10, opacity: 0.75, marginTop: 4 }}>
                  {m.from === "doctor" ? "Doctor" : "Patient"} ·{" "}
                  {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        dir="auto"
        placeholder="Type a message"
        style={{
          width: "100%",
          minHeight: 60,
          marginTop: 10,
          borderRadius: 12,
          border: "1px solid #ddd",
          padding: 10,
          fontFamily: "inherit",
        }}
      />
      {note && <p style={{ color: "#c1272d", fontSize: 13, margin: "6px 0 0" }}>{note}</p>}
      <div className="chips" style={{ marginTop: 8 }}>
        <button className="chip on" onClick={send}>Send</button>
      </div>
    </div>
  );
}
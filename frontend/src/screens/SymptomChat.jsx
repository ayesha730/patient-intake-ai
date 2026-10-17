import { useState } from "react";

const CHAT_URL = "http://localhost:3001/api/ai/chat";
const BURGUNDY = "#7a1f2e";

export default function SymptomChat({ messages = [], onChange, onBack, onContinue }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const lastAi = [...messages].reverse().find((m) => m.from === "ai");
  const emergency = Boolean(lastAi && lastAi.redFlag);

  const send = async () => {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { from: "patient", text: clean, time: new Date().toISOString() }];
    onChange(next);
    setText("");
    setBusy(true);
    setNote("");
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!data.ok) {
        setNote(data.reason || "The AI is not available. You can still book a doctor.");
      } else {
        onChange([
          ...next,
          {
            from: "ai",
            text: data.reply,
            time: new Date().toISOString(),
            specialty: data.specialty,
            redFlag: data.redFlag,
            done: data.done,
            suggestions: data.suggestions || [],
          },
        ]);
      }
    } catch {
      setNote("Cannot reach the local server. You can still book a doctor.");
    } finally {
      setBusy(false);
    }
  };

  const suggestionCount = lastAi && lastAi.suggestions ? lastAi.suggestions.length : 0;

  return (
    <div className="page">
      <button className="link" onClick={onBack} style={{ fontSize: 16 }}>← Back</button>

      <h2 style={{ marginTop: 12, marginBottom: 4 }}>Tell the AI about your problem</h2>
      <p style={{ fontSize: 15, color: "#666", margin: 0 }}>
        This is not a diagnosis. The doctor will check you.
      </p>

      {emergency && (
        <div style={{ background: "#fdecec", border: "2px solid #c1272d", borderRadius: 14, padding: 14, marginTop: 12 }}>
          <strong style={{ color: "#c1272d", fontSize: 17 }}>
            Possible emergency. Call emergency services now.
          </strong>
        </div>
      )}

      <div style={{ marginTop: 14, maxHeight: 380, overflowY: "auto" }}>
        {messages.length === 0 && (
          <p style={{ fontSize: 16, color: "#444" }}>
            Write what is bothering you, for example: "I have a headache for 3 days".
          </p>
        )}
        {messages.map((m, i) => {
          const mine = m.from === "patient";
          return (
            <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", margin: "8px 0" }}>
              <div
                dir="auto"
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 16,
                  lineHeight: 1.5,
                  background: mine ? BURGUNDY : "#f2f2f2",
                  color: mine ? "#fff" : "#222",
                  whiteSpace: "pre-line",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {busy && <p style={{ fontSize: 15, color: "#666" }}>The AI is thinking...</p>}
      </div>

      {lastAi && lastAi.specialty && (
        <p style={{ fontSize: 16, marginTop: 10 }}>
          Suggested doctor: <strong>{lastAi.specialty}</strong>
        </p>
      )}

      {lastAi && lastAi.done && (
        <div style={{ background: "#f5f1f2", borderRadius: 12, padding: 12, marginTop: 8, fontSize: 15 }}>
          {suggestionCount > 0
            ? suggestionCount + " suggestions were sent to your doctor. You will see the ones your doctor approves."
            : "Your doctor will see this chat."}
        </div>
      )}

      {note && <p style={{ color: "#c1272d", fontSize: 15 }}>{note}</p>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here"
        dir="auto"
        style={{
          width: "100%",
          minHeight: 70,
          marginTop: 10,
          borderRadius: 12,
          border: "1px solid #ccc",
          padding: 10,
          fontSize: 16,
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={send}
        disabled={busy}
        style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600, marginTop: 8, background: "#f2f2f2", color: "#222" }}
      >
        Send to AI
      </button>

      <button
        onClick={onContinue}
        style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 600, marginTop: 10, background: BURGUNDY, color: "#fff" }}
      >
        Book a doctor
      </button>
    </div>
  );
}
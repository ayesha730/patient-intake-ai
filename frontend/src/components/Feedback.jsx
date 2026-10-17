import { useState } from "react";

const BURGUNDY = "#7a1f2e";

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

// Patient rates the doctor. Shown only after the doctor marks the treatment as finished.
export function PatientFeedback({ record, onSave }) {
  const existing = record.feedback || null;
  const [chosen, setChosen] = useState(0);
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");

  if (!record.treatmentDone) return null;

  if (existing) {
    return (
      <div className="card-box" style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: 16 }}>Thank you for your review</strong>
        <p style={{ fontSize: 15, margin: "6px 0" }}>
          You rated your doctor {existing.stars} of 5 stars.
        </p>
        {existing.comment && <p className="muted">{existing.comment}</p>}
      </div>
    );
  }

  const submit = () => {
    if (chosen === 0) {
      setNote("Please tap a number from 1 to 5.");
      return;
    }
    onSave({
      stars: chosen,
      comment: comment.trim().slice(0, 500),
      time: new Date().toISOString(),
    });
  };

  return (
    <div className="card-box" style={{ marginBottom: 12 }}>
      <strong style={{ fontSize: 16 }}>Rate your doctor</strong>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 8px" }}>
        1 = very bad, 5 = very good
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setChosen(n)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "2px solid " + BURGUNDY,
              background: chosen >= n ? BURGUNDY : "#fff",
              color: chosen >= n ? "#fff" : BURGUNDY,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you want to tell us? (optional)"
        dir="auto"
        style={{
          width: "100%",
          minHeight: 60,
          marginTop: 10,
          borderRadius: 12,
          border: "1px solid #ccc",
          padding: 10,
          fontSize: 15,
          fontFamily: "inherit",
        }}
      />
      {note && <p style={{ color: "#c1272d", fontSize: 14 }}>{note}</p>}
      <button
        onClick={submit}
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
        Send review
      </button>
    </div>
  );
}

// Doctor marks the treatment as finished, and sees the patient's rating
export function FeedbackView({ record, onUpdate }) {
  const fb = record.feedback;
  const done = Boolean(record.treatmentDone);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 14, padding: 14, marginBottom: 12 }}>
      <strong style={{ fontSize: 17 }}>Treatment and review</strong>
      <p style={{ fontSize: 15, margin: "6px 0" }}>
        {done
          ? "Treatment marked as finished. The patient can now rate you."
          : "Treatment is not marked as finished yet."}
      </p>

      {!done && onUpdate && (
        <button
          onClick={() => onUpdate(record.id, { treatmentDone: true })}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: BURGUNDY,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Mark treatment as finished
        </button>
      )}

      {done && !fb && <p className="muted">Waiting for the patient's rating.</p>}

      {fb && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 17, margin: 0, color: BURGUNDY }}>
            <strong>{stars(fb.stars)}</strong> {fb.stars} of 5
          </p>
          {fb.comment && (
            <p dir="auto" style={{ fontSize: 15, margin: "6px 0 0" }}>{fb.comment}</p>
          )}
        </div>
      )}
    </div>
  );
}
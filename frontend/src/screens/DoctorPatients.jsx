import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const DOCTOR_ID = 1; // temporary until doctor login is built

export default function DoctorPatients() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/dashboard/doctors/${DOCTOR_ID}/patients`)
      .then((r) => {
        if (!r.ok) throw new Error(`server returned ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(`Could not load patients (${e.message})`));
  }, []);

  return (
    <div className="page">
      <h2>Today's patients</h2>
      <p className="muted">AI summaries are drafts. Check the patient's own words before acting.</p>

      {error && <p className="muted">{error}</p>}
      {!error && items.length === 0 && <p className="muted">No patients booked yet.</p>}

      {items.map((p) => (
        <div className="card-box" key={p.appointment_id}>
          <div className="doc-row">
            <strong>Token {p.token_number}</strong>
            <span className="muted">{p.slot_time ? p.slot_time.replace("T", " ") : ""}</span>
          </div>

          <div style={{ margin: "8px 0" }}>
            {p.urgency === "urgent" && <span className="badge urgent">Urgent</span>}
            {p.needs_review && <span className="badge review">Needs review</span>}
            <span className="badge info">Confidence: {p.confidence}</span>
          </div>

          <p style={{ margin: "6px 0" }}><strong>Summary:</strong> {p.summary}</p>
          <p className="muted" style={{ margin: 0 }}><strong>Patient's words:</strong> {p.original_text}</p>
        </div>
      ))}
    </div>
  );
}
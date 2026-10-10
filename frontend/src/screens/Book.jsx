import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";
const LANGUAGES = ["English", "Urdu", "German", "Arabic", "French", "Spanish", "Other"];
const GENDERS = ["Female", "Male", "Other"];
const SEVERITY = ["mild", "moderate", "severe"];

const field = {
  width: "100%", border: "1px solid #ddd", borderRadius: 12, padding: 10,
  fontSize: 15, boxSizing: "border-box", marginTop: 8, fontFamily: "inherit",
};

export default function Book({ onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    language: "English", consent: false,
    name: "", age: "", gender: "Female",
    problem: "", duration: "", severity: "",
    doctorId: null, slot: "",
  });
  const [check, setCheck] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [emergency, setEmergency] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (step !== 3) return;
    fetch(`${API}/doctors`)
      .then((r) => r.json())
      .then(setDoctors)
      .catch(() => setError("Could not load doctors. Is the backend running?"));
  }, [step]);

  const suggested = check?.suggested_specialty;
  const matching = doctors.filter((d) => d.specialty === suggested);
  const list = matching.length ? matching : doctors;

  const runCheck = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/intake/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: form.problem,
          duration: form.duration || null,
          severity: form.severity || null,
        }),
      });
      const data = await r.json();
      if (data.emergency) {
        setEmergency(data.matched.join(", "));
        return;
      }
      setCheck(data);
      if (data.followups.length === 0) setStep(3);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  };

  const book = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          language: form.language,
          consent: form.consent,
          doctor_id: form.doctorId,
          slot_time: form.slot,
          problem: form.problem,
          duration: form.duration || null,
          severity: form.severity || null,
        }),
      });
      const data = await r.json();
      if (r.status === 409) {
        setEmergency(data.detail.matched.join(", "));
        return;
      }
      if (!r.ok) throw new Error(data.detail || `server returned ${r.status}`);
      setResult(data);
      setStep(4);
    } catch (e) {
      setError(`Booking failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  if (emergency) {
    return (
      <div className="page">
        <div className="card-box" style={{ borderLeft: "6px solid var(--red)" }}>
          <h2 style={{ color: "var(--red)" }}>Get help now</h2>
          <p>Your symptoms may be an emergency. Please go to the nearest emergency department or call 1122 now.</p>
          <p className="muted">Matched: {emergency}</p>
          <p className="muted">Booking is stopped.</p>
          <button className="btn solid" onClick={onClose}>BACK</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="link" onClick={onClose}>✕ Cancel</button>
      {step < 4 && <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Step {step + 1} of 4</div>}
      {error && <p style={{ color: "var(--red)" }}>{error}</p>}

      {step === 0 && (
        <>
          <h2>Language and consent</h2>
          <p className="muted">Pick the language you are most comfortable with.</p>
          <div className="chips">
            {LANGUAGES.map((l) => (
              <button key={l} className={`chip ${form.language === l ? "on" : ""}`} onClick={() => update("language", l)}>
                {l}
              </button>
            ))}
          </div>
          <div className="card-box" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              style={{ width: "auto", marginTop: 4 }}
              checked={form.consent}
              onChange={(e) => update("consent", e.target.checked)}
            />
            <span className="muted" style={{ fontSize: 14 }}>
              I agree that my details and symptoms are shared with the doctor I book. An AI tool only restates
              my words and never gives a diagnosis.
            </span>
          </div>
          <button className="btn solid" disabled={!form.consent} onClick={() => setStep(1)}>CONTINUE</button>
        </>
      )}

      {step === 1 && (
        <>
          <h2>Your details</h2>
          <label>Full name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} />
          <label>Age</label>
          <input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} />
          <label>Gender</label>
          <div className="chips">
            {GENDERS.map((g) => (
              <button key={g} className={`chip ${form.gender === g ? "on" : ""}`} onClick={() => update("gender", g)}>
                {g}
              </button>
            ))}
          </div>
          <button className="btn solid" disabled={!form.name || !form.age} onClick={() => setStep(2)}>CONTINUE</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Describe the problem</h2>
          <p className="muted">Write in your own language. The doctor sees your exact words.</p>
          <textarea
            style={{ ...field, minHeight: 100 }}
            placeholder="e.g. I have a headache"
            value={form.problem}
            onChange={(e) => update("problem", e.target.value)}
          />
          <label>How long have you had it?</label>
          <input placeholder="e.g. 3 days" value={form.duration} onChange={(e) => update("duration", e.target.value)} />
          <label>How severe is it?</label>
          <div className="chips">
            {SEVERITY.map((s) => (
              <button key={s} className={`chip ${form.severity === s ? "on" : ""}`} onClick={() => update("severity", s)}>
                {s}
              </button>
            ))}
          </div>
          {check && check.followups.length > 0 && (
            <p className="muted">Please answer: {check.followups.join(" ")}</p>
          )}
          <button className="btn solid" disabled={!form.problem || busy} onClick={runCheck}>
            {busy ? "CHECKING..." : "CHECK MY PROBLEM"}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Choose a doctor</h2>
          <p className="muted">Suggested specialty: <strong>{suggested}</strong></p>
          {!matching.length && doctors.length > 0 && (
            <p className="muted">No {suggested} doctors yet, so all doctors are shown.</p>
          )}
          {list.map((d) => (
            <div
              key={d.id}
              className="card-box"
              onClick={() => update("doctorId", d.id)}
              style={{
                cursor: "pointer",
                border: form.doctorId === d.id ? "2px solid var(--burgundy)" : "2px solid transparent",
              }}
            >
              <div className="doc-row">
                <strong>{d.name}</strong>
                <span className="price">Rs {d.fee}</span>
              </div>
              <div className="muted">{d.specialty} · {d.experience_years} yrs · ★ {d.rating}</div>
              <div className="muted">{d.degree} {d.level}</div>
            </div>
          ))}
          <label>Preferred date and time</label>
          <input type="datetime-local" value={form.slot} onChange={(e) => update("slot", e.target.value)} />
          <button className="btn solid" disabled={!form.doctorId || !form.slot || busy} onClick={book}>
            {busy ? "BOOKING..." : "BOOK APPOINTMENT"}
          </button>
        </>
      )}

      {step === 4 && result && (
        <div className="card-box feature" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Your token number</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{result.token_number}</div>
          <div>{result.doctor} · {result.slot_time.replace("T", " ")}</div>
          <p style={{ fontSize: 14 }}>Keep this token. The doctor can see your details.</p>
          {result.needs_review && (
            <p style={{ fontSize: 14 }}>
              Some details are missing ({result.missing_info}). Staff will review your case before the visit.
            </p>
          )}
          <button className="btn light" onClick={onClose}>DONE</button>
        </div>
      )}
    </div>
  );
}
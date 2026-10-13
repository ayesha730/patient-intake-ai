import { useState } from "react";
import { LANGUAGES } from "../lib/i18n";

const LEVELS = ["Junior", "Senior", "Consultant"];
const SPECIALTIES = ["General Physician", "Cardiology", "Dermatology"];

export default function DoctorProfile({ profile, onSave }) {
  const [form, setForm] = useState(profile);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (key, value) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = () => {
    const exp = Number(form.experience);
    const fee = Number(form.fee);

    if (!form.name.trim() || !form.hospitalId.trim() || !form.degree.trim()) {
      setError("Please fill in your name, hospital ID and degree.");
      return;
    }
    if (!form.specialty) {
      setError("Please choose your specialty.");
      return;
    }
    if (!form.level) {
      setError("Please choose your level.");
      return;
    }
    if (form.experience === "" || exp < 0 || exp > 60) {
      setError("Experience must be between 0 and 60 years.");
      return;
    }
    if (form.fee === "" || fee < 0) {
      setError("Please enter a valid fee.");
      return;
    }

    setError("");
    onSave({ ...form, name: form.name.trim(), experience: exp, fee });
    setSaved(true);
  };

  return (
    <div className="page">
      <h2>Doctor profile</h2>
      <p className="muted">Shown to patients when they compare doctors.</p>

      <label>Full name</label>
      <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Dr. Sara Khan" />

      <label>Hospital ID</label>
      <input value={form.hospitalId} onChange={(e) => set("hospitalId", e.target.value)} placeholder="Given by your hospital" />

      <label>Degree</label>
      <input value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="MBBS, FCPS, MD" />

      <label>Specialty</label>
      <div className="chips">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            className={`chip ${form.specialty === s ? "on" : ""}`}
            onClick={() => set("specialty", s)}
          >
            {s}
          </button>
        ))}
      </div>

      <label>Level</label>
      <div className="chips">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            className={`chip ${form.level === lvl ? "on" : ""}`}
            onClick={() => set("level", lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      <label>Experience (years)</label>
      <input
        type="number"
        min="0"
        max="60"
        value={form.experience}
        onChange={(e) => set("experience", e.target.value)}
      />

      <label>Consultation fee (Rs)</label>
      <input
        type="number"
        min="0"
        value={form.fee}
        onChange={(e) => set("fee", e.target.value)}
      />

      <label>Your language</label>
      <div className="chips">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            className={`chip ${form.language === l.code ? "on" : ""}`}
            onClick={() => set("language", l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#c1272d", fontSize: 13 }}>{error}</p>}
      {saved && <p style={{ color: "#2e7d32", fontSize: 13 }}>Profile saved. Patients can now see you.</p>}

      <button className="btn solid" onClick={handleSave}>SAVE PROFILE</button>
    </div>
  );
}
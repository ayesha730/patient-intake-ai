import { useState } from "react";

const BURGUNDY = "#7a1f2e";
const PATIENT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "pa", label: "پنجابی" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
];
const GENDERS = ["Male", "Female", "Other"];

const btn = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "none",
  fontSize: 17,
  fontWeight: 600,
  marginTop: 10,
  background: BURGUNDY,
  color: "#fff",
};

// Step 1: language and consent. Step 2: name, age and gender.
export default function Consent({ onBack, onDone }) {
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("en");
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [note, setNote] = useState("");

  const goNext = () => {
    if (step === 1) {
      if (!agreed) return setNote("Please tick the box to continue.");
      setNote("");
      return setStep(2);
    }
    const ageNumber = Number(age);
    if (!name.trim()) return setNote("Please write your name.");
    if (!ageNumber || ageNumber < 0 || ageNumber > 120) return setNote("Please write a valid age.");
    if (!gender) return setNote("Please choose a gender.");
    onDone({
      name: name.trim(),
      age: ageNumber,
      gender,
      language,
      consentAt: new Date().toISOString(),
    });
  };

  return (
    <div className="page">
      <button className="link" onClick={step === 1 ? onBack : () => setStep(1)} style={{ fontSize: 16 }}>
        ← Back
      </button>

      {step === 1 && (
        <>
          <h2 style={{ marginTop: 12 }}>Choose your language</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PATIENT_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "2px solid " + BURGUNDY,
                  background: language === l.code ? BURGUNDY : "#fff",
                  color: language === l.code ? "#fff" : BURGUNDY,
                  fontSize: 15,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <h2 style={{ marginTop: 20 }}>Your consent</h2>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>
            Your answers are stored securely. They are shared only with clinic staff and your doctor.
            An AI helps write a short summary for your doctor. The AI does not diagnose, and your doctor
            decides on any treatment.
          </p>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I agree
          </label>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ marginTop: 12 }}>About you</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ccc", fontSize: 16, marginBottom: 10 }}
          />
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            inputMode="numeric"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ccc", fontSize: 16 }}
          />
          <p style={{ fontSize: 15, marginTop: 14 }}>Gender</p>
          <div style={{ display: "flex", gap: 8 }}>
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: "2px solid " + BURGUNDY,
                  background: gender === g ? BURGUNDY : "#fff",
                  color: gender === g ? "#fff" : BURGUNDY,
                  fontSize: 15,
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </>
      )}

      {note && <p style={{ color: "#c1272d", fontSize: 14, marginTop: 10 }}>{note}</p>}

      <button onClick={goNext} style={btn}>
        {step === 1 ? "Continue" : "Start"}
      </button>
    </div>
  );
}
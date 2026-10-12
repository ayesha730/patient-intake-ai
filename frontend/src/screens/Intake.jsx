import { useState } from "react";
import {
  checkRedFlags,
  suggestSpecialty,
  detectDuration,
  findMissing,
  classifyUrgency,
} from "../lib/intakeRules";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

// Translations below should be checked by a native speaker before release
const CONSENT = {
  en: "I agree that my description is shared with a doctor and used to prepare my visit. The AI only restates what I say and does not diagnose. My data is encrypted and every access is logged.",
  ur: "میں اس بات پر رضامند ہوں کہ میری تفصیل ڈاکٹر کے ساتھ شیئر کی جائے گی اور میری ملاقات کی تیاری کے لیے استعمال ہوگی۔ AI صرف وہی دہراتا ہے جو میں کہتا ہوں، تشخیص نہیں کرتا۔ میرا ڈیٹا خفیہ ہے اور ہر رسائی ریکارڈ کی جاتی ہے۔",
  de: "Ich stimme zu, dass meine Beschreibung an einen Arzt weitergegeben und zur Vorbereitung meines Termins verwendet wird. Die KI gibt nur wieder, was ich sage, und stellt keine Diagnose. Meine Daten sind verschlüsselt und jeder Zugriff wird protokolliert.",
  ar: "أوافق على مشاركة وصفي مع الطبيب واستخدامه لتجهيز زيارتي. يعيد الذكاء الاصطناعي صياغة ما أقوله فقط ولا يشخّص. بياناتي مشفّرة ويُسجَّل كل وصول إليها.",
};

const DURATIONS = ["Less than 1 day", "1–3 days", "4–7 days", "More than a week"];
const STEPS = ["language", "consent", "describe", "followup", "result"];
const TITLES = {
  language: "Choose your language",
  consent: "Consent",
  describe: "Describe your problem",
  followup: "A few details",
  result: "Your intake",
  emergency: "Urgent care needed",
};

const textareaStyle = {
  width: "100%",
  minHeight: 140,
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 12,
  fontFamily: "inherit",
  fontSize: 15,
  marginTop: 12,
  resize: "vertical",
};

export default function Intake({ onBack, onComplete }) {
  const [step, setStep] = useState("language");
  const [lang, setLang] = useState("en");
  const [agreed, setAgreed] = useState(false);
  const [problem, setProblem] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(null);
  const [flags, setFlags] = useState([]);

  const missing = findMissing({ duration, severity });

  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (step === "emergency" || i <= 0) onBack();
    else setStep(STEPS[i - 1]);
  };

  // Red-flag check runs first. Emergency symptoms skip the follow-up questions.
  const handleDescribe = () => {
    if (!problem.trim()) return;
    const found = checkRedFlags(problem);
    setFlags(found);
    setDuration(detectDuration(problem));
    setStep(found.length > 0 ? "emergency" : "followup");
  };

  const buildRecord = (urgency) => ({
    problem: problem.trim(),
    language: lang,
    duration,
    severity,
    flags,
    missing,
    specialty: suggestSpecialty(problem),
    urgency,
    createdAt: new Date().toISOString(),
  });

  const headerKey = step === "emergency" ? "emergency" : step;

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={goBack} aria-label="Go back">←</button>
        <h1>{TITLES[headerKey]}</h1>
      </div>

      <div className="sheet">
        {step === "language" && (
          <>
            <p className="muted">Your doctor will read your visit in their own language.</p>
            <div className="chips">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  className={`chip ${lang === l.code ? "on" : ""}`}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button className="btn solid" onClick={() => setStep("consent")}>CONTINUE</button>
          </>
        )}

        {step === "consent" && (
          <>
            <p style={{ color: "#2a0a1f", fontSize: 15, lineHeight: 1.5 }}>{CONSENT[lang]}</p>
            <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#2a0a1f" }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree
            </label>
            <button
              className="btn solid"
              disabled={!agreed}
              style={{ opacity: agreed ? 1 : 0.5 }}
              onClick={() => setStep("describe")}
            >
              CONTINUE
            </button>
          </>
        )}

        {step === "describe" && (
          <>
            <p className="muted">Describe it in your own words. Example: "I have had a headache for 3 days."</p>
            <textarea
              style={textareaStyle}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Write here..."
            />
            <button className="btn solid" onClick={handleDescribe}>CONTINUE</button>
          </>
        )}

        {step === "followup" && (
          <>
            <div className="card-box" style={{ marginTop: 0 }}>
              <strong>Missing information</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                {missing.length ? missing.join(", ") : "None. Thank you."}
              </p>
            </div>

            {!duration && (
              <>
                <label>How long have you had this?</label>
                <div className="chips">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      className={`chip ${duration === d ? "on" : ""}`}
                      onClick={() => setDuration(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}

            {severity == null && (
              <>
                <label>How severe is it? (1 = mild, 10 = worst)</label>
                <div className="chips">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      className={`chip ${severity === n ? "on" : ""}`}
                      onClick={() => setSeverity(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              className="btn solid"
              disabled={missing.length > 0}
              style={{ opacity: missing.length ? 0.5 : 1 }}
              onClick={() => setStep("result")}
            >
              CONTINUE
            </button>
          </>
        )}

        {step === "emergency" && (
          <>
            <div
              className="card-box"
              style={{ marginTop: 0, background: "#fdecec", border: "1px solid #c1272d" }}
            >
              <strong style={{ color: "#c1272d" }}>Emergency symptoms reported</strong>
              <p style={{ margin: "8px 0", color: "#2a0a1f", fontSize: 14, lineHeight: 1.5 }}>
                Booking is stopped. Call your local emergency number or go to the nearest
                emergency room now. Hospital staff have been alerted.
              </p>
              <p className="muted" style={{ margin: 0 }}>
                Detected: {flags.join(", ")}
              </p>
            </div>
            <button className="btn solid" onClick={() => onComplete(buildRecord("emergency"))}>
              I UNDERSTAND
            </button>
          </>
        )}

        {step === "result" && (
          <>
            <div className="card-box" style={{ marginTop: 0 }}>
              <p className="muted" style={{ margin: 0 }}>Suggested specialty</p>
              <p style={{ margin: "4px 0 10px", fontWeight: 700, color: "#2a0a1f" }}>
                {suggestSpecialty(problem)}
              </p>
              <span className={`badge ${classifyUrgency(problem) === "uncertain" ? "review" : "info"}`}>
                {classifyUrgency(problem) === "uncertain" ? "Needs review" : "Normal"}
              </span>
              {classifyUrgency(problem) === "uncertain" && (
                <p className="muted" style={{ marginTop: 10 }}>
                  Your description is short, so a staff member will check it before your visit.
                </p>
              )}
            </div>
            <button
              className="btn solid"
              onClick={() => onComplete(buildRecord(classifyUrgency(problem)))}
            >
              CHOOSE A DOCTOR
            </button>
          </>
        )}
      </div>
    </>
  );
}
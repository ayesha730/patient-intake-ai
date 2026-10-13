import { useState } from "react";
import { checkRedFlags, suggestSpecialty, detectDuration, classifyUrgency } from "../lib/intakeRules";
import { LANGUAGES, tr, dirOf } from "../lib/i18n";
import { ft } from "../lib/patientFields";
import { specialtyName } from "../lib/specialties";

const STEPS = ["language", "consent", "details", "describe", "followup", "result"];

const TITLE_KEY = {
  language: "chooseLang",
  consent: "consentTitle",
  describe: "describeTitle",
  followup: "followupTitle",
  result: "resultTitle",
  emergency: "emergencyTitle",
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
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [problem, setProblem] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(null);
  const [flags, setFlags] = useState([]);

  const T = (key) => tr(lang, key);
  const F = (key) => ft(lang, key);
  const dir = dirOf(lang);

  const ageNumber = Number(age);
  const detailsOk = name.trim() !== "" && ageNumber >= 1 && ageNumber <= 120 && gender !== "";

  // Missing items are translated, so they follow the chosen language
  const missing = [];
  if (!duration) missing.push(T("durationLabel"));
  if (severity == null) missing.push(T("severityLabel"));

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
    name: name.trim(),
    age: ageNumber,
    gender,
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

  const urgency = classifyUrgency(problem);
  const durations = T("durations");
  const title = step === "details" ? F("title") : T(TITLE_KEY[step]);

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={goBack} aria-label={T("backBtn")}>←</button>
        <h1>{title}</h1>
      </div>

      <div className="sheet" dir={dir}>
        {step === "language" && (
          <>
            <p className="muted">{T("langHint")}</p>
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
            <button className="btn solid" onClick={() => setStep("consent")}>{T("next")}</button>
          </>
        )}

        {step === "consent" && (
          <>
            <p style={{ color: "#2a0a1f", fontSize: 15, lineHeight: 1.5 }}>{T("consentText")}</p>
            <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#2a0a1f" }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              {T("agree")}
            </label>
            <button
              className="btn solid"
              disabled={!agreed}
              style={{ opacity: agreed ? 1 : 0.5 }}
              onClick={() => setStep("details")}
            >
              {T("next")}
            </button>
          </>
        )}

        {step === "details" && (
          <>
            <p className="muted">{F("hint")}</p>

            <label>{F("name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label>{F("age")}</label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />

            <label>{F("gender")}</label>
            <div className="chips">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  className={`chip ${gender === g ? "on" : ""}`}
                  onClick={() => setGender(g)}
                >
                  {F(g)}
                </button>
              ))}
            </div>

            <button
              className="btn solid"
              disabled={!detailsOk}
              style={{ opacity: detailsOk ? 1 : 0.5 }}
              onClick={() => setStep("describe")}
            >
              {T("next")}
            </button>
          </>
        )}

        {step === "describe" && (
          <>
            <p className="muted">{T("describeHint")}</p>
            <textarea
              lang={lang}
              dir={dir}
              style={{ ...textareaStyle, textAlign: dir === "rtl" ? "right" : "left" }}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder={T("describePlaceholder")}
            />
            <button className="btn solid" onClick={handleDescribe}>{T("next")}</button>
          </>
        )}

        {step === "followup" && (
          <>
            <div className="card-box" style={{ marginTop: 0 }}>
              <strong>{T("missing")}</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                {missing.length ? missing.join(", ") : T("noneMissing")}
              </p>
            </div>

            {!duration && (
              <>
                <label>{T("durationQ")}</label>
                <div className="chips">
                  {durations.map((d, i) => (
                    <button
                      key={i}
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
                <label>{T("severityQ")}</label>
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
              {T("next")}
            </button>
          </>
        )}

        {step === "emergency" && (
          <>
            <div
              className="card-box"
              style={{ marginTop: 0, background: "#fdecec", border: "1px solid #c1272d" }}
            >
              <strong style={{ color: "#c1272d" }}>{T("emergencyHead")}</strong>
              <p style={{ margin: "8px 0", color: "#2a0a1f", fontSize: 14, lineHeight: 1.5 }}>
                {T("emergencyText")}
              </p>
            </div>
            <button className="btn solid" onClick={() => onComplete(buildRecord("emergency"))}>
              {T("understand")}
            </button>
          </>
        )}

        {step === "result" && (
          <>
            <div className="card-box" style={{ marginTop: 0 }}>
              <p className="muted" style={{ margin: 0 }}>{T("suggested")}</p>
              <p style={{ margin: "4px 0 10px", fontWeight: 700, color: "#2a0a1f" }}>
                {specialtyName(lang, suggestSpecialty(problem))}
              </p>
              <span className={`badge ${urgency === "uncertain" ? "review" : "info"}`}>
                {urgency === "uncertain" ? T("needsReview") : T("normal")}
              </span>
              {urgency === "uncertain" && (
                <p className="muted" style={{ marginTop: 10 }}>{T("reviewNote")}</p>
              )}
            </div>
            <button className="btn solid" onClick={() => onComplete(buildRecord(urgency))}>
              {T("chooseDoctor")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
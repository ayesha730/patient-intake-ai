import { useState } from "react";
import { DOCTORS, TIME_SLOTS } from "../lib/doctors";

// Translations should be checked by a native speaker before release
const LABELS = {
  en: { token: "Token number", doctor: "Doctor", time: "Time", done: "DONE" },
  ur: { token: "ٹوکن نمبر", doctor: "ڈاکٹر", time: "وقت", done: "ٹھیک ہے" },
  de: { token: "Token-Nummer", doctor: "Arzt", time: "Zeit", done: "FERTIG" },
  ar: { token: "رقم التوكن", doctor: "الطبيب", time: "الوقت", done: "تم" },
};

const CONFIRM = {
  en: (t) => `Your token number is ${t}. Please arrive 15 minutes early.`,
  ur: (t) =>` آپ کا ٹوکن نمبر ${t} ہے۔ براہ کرم 15 منٹ پہلے پہنچیں۔`,
  de: (t) => `Ihre Token-Nummer ist ${t}. Bitte kommen Sie 15 Minuten früher.`,
  ar: (t) =>` رقم التوكن الخاص بك هو ${t}. يرجى الحضور قبل الموعد بـ 15 دقيقة.`,
};

export default function Book({ record, onClose }) {
  const [step, setStep] = useState("doctor");
  const [doctor, setDoctor] = useState(null);
  const [slot, setSlot] = useState("");

  // No intake yet: show a message instead of a broken screen
  if (!record) {
    return (
      <>
        <div className="top grad">
          <button className="back" onClick={onClose} aria-label="Go back">←</button>
          <h1>Book appointment</h1>
        </div>
        <div className="sheet">
          <p className="muted">Please complete the intake first.</p>
          <button className="btn solid" onClick={onClose}>BACK</button>
        </div>
      </>
    );
  }

  const lang = LABELS[record.language] ? record.language : "en";
  const L = LABELS[lang];
  const isRtl = lang === "ur" || lang === "ar";

  // Doctors who match the suggested specialty come first
  const sorted = [...DOCTORS].sort(
    (a, b) => (b.specialty === record.specialty) - (a.specialty === record.specialty)
  );

  const titles = { doctor: "Choose a doctor", slot: "Choose a time", done: "Confirmed" };

  const goBack = () => {
    if (step === "slot") setStep("doctor");
    else onClose();
  };

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={goBack} aria-label="Go back">←</button>
        <h1>{titles[step]}</h1>
      </div>

      <div className="sheet" dir={isRtl ? "rtl" : "ltr"}>
        {step === "doctor" && (
          <>
            <p className="muted">
              Suggested specialty: <strong>{record.specialty}</strong>
            </p>
            {sorted.map((d) => (
              <button
                key={d.id}
                className="card-box"
                style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", display: "block" }}
                onClick={() => {
                  setDoctor(d);
                  setStep("slot");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <strong style={{ color: "#2a0a1f" }}>{d.name}</strong>
                    <p className="muted" style={{ margin: "2px 0 0" }}>{d.specialty}</p>
                    <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
                      {d.experience} years experience
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="price">Rs {d.fee}</span>
                    <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>★ {d.rating}</p>
                  </div>
                </div>
                {d.specialty === record.specialty && (
                  <span className="badge info" style={{ marginTop: 10 }}>Matches your problem</span>
                )}
              </button>
            ))}
          </>
        )}

        {step === "slot" && doctor && (
          <>
            <div className="card-box" style={{ marginTop: 0 }}>
              <strong style={{ color: "#2a0a1f" }}>{doctor.name}</strong>
              <p className="muted" style={{ margin: "2px 0 0" }}>{doctor.specialty}</p>
            </div>

            <label>Today's time</label>
            <div className="chips">
              {TIME_SLOTS.map((s) => (
                <button
                  key={s}
                  className={`chip ${slot === s ? "on" : ""}`}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              className="btn solid"
              disabled={!slot}
              style={{ opacity: slot ? 1 : 0.5 }}
              onClick={() => setStep("done")}
            >
              CONFIRM BOOKING
            </button>
          </>
        )}

        {step === "done" && doctor && (
          <>
            <div className="card-box feature" style={{ marginTop: 0 }}>
              <p className="muted" style={{ margin: 0 }}>{L.token}</p>
              <p style={{ fontSize: 48, fontWeight: 700, margin: "4px 0" }}>{record.token}</p>
              <p style={{ margin: 0 }}>{L.doctor}: {doctor.name}</p>
              <p style={{ margin: "4px 0 0" }}>{L.time}: {slot}</p>
            </div>

            <p style={{ marginTop: 16, color: "#2a0a1f", lineHeight: 1.6 }}>
              {CONFIRM[lang](record.token)}
            </p>

            <button className="btn solid" onClick={onClose}>{L.done}</button>
          </>
        )}
      </div>
    </>
  );
}
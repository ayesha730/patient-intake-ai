import Attachments from "../components/Attachments";
import SuggestionReview from "../components/SuggestionReview";
import { useState } from "react";
import { buildSummary, checkOutput } from "../lib/summary";
import { specialtyName } from "../lib/specialties";
import { compareLists, parseList } from "../lib/medicines";
import { translateText } from "../lib/translate";
import { LANGUAGES } from "../lib/i18n";
import Chat from "../components/Chat";

const BURGUNDY = "#7a1f2e";
const ORDER = { emergency: 0, uncertain: 1, normal: 2 };
const CONF_WORD = { high: "High", medium: "Medium", low: "Low" };

const CARD = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  marginTop: 14,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};
const BIG_BUTTON = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  fontSize: 17,
  fontWeight: 600,
  border: "none",
  marginTop: 10,
  cursor: "pointer",
};
const TEXT = { fontSize: 16, lineHeight: 1.6, margin: "8px 0 0" };
const LABEL = { fontSize: 14, color: "#666", margin: 0 };
const TEXTAREA = {
  width: "100%",
  minHeight: 80,
  marginTop: 8,
  borderRadius: 12,
  border: "1px solid #ccc",
  padding: 10,
  fontSize: 16,
  fontFamily: "inherit",
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function langName(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? found.label : code;
}

function statusWord(r) {
  if (r.urgency === "emergency") return "Emergency";
  if (r.reviewStatus === "approved") return "Approved";
  if (r.reviewStatus === "edited") return "Approved (edited)";
  if (r.reviewStatus === "rejected") return "Rejected";
  return "Waiting for you";
}

export default function DoctorPatients({ records = [], alerts = [], onUpdate, profile }) {
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState("");
  const [rxDraft, setRxDraft] = useState("");
  const [menDraft, setMenDraft] = useState("");
  const [medSaved, setMedSaved] = useState(false);

  const doctorLang = (profile && profile.language) || "en";
  const current = records.find((r) => r.id === openId);

  const openRecord = (r) => {
    setOpenId(r.id);
    setEditing(false);
    setWarning("");
    setRxDraft((r.prescription || []).join(", "));
    setMenDraft((r.patientMedicines || []).join(", "));
    setMedSaved(false);
  };

  // ----- One patient, shown simply -----
  if (current) {
    const summary = buildSummary(current);
    const shown = current.summary || current.aiSummary || summary.restated;
    const confidence = current.aiConfidence || summary.confidence;
    const sourceText = current.summary
      ? "Edited by you"
      : current.aiSummary
      ? "Written by AI from what the patient said"
      : "Written from the form answers";
    const translation = translateText(current.problem, current.language, doctorLang);
    const cmp = compareLists(current.prescription || [], current.patientMedicines || []);

    const startEdit = () => {
      setDraft(shown);
      setWarning("");
      setEditing(true);
    };

    const saveEdit = () => {
      const hit = checkOutput(draft);
      if (hit) {
        setWarning("This text has words that sound like a diagnosis (\"" + hit + "\"). Please change it.");
        return;
      }
      onUpdate(current.id, { summary: draft, reviewStatus: "edited" });
      setEditing(false);
    };

    const approve = () => onUpdate(current.id, { reviewStatus: "approved" });
    const reject = () => onUpdate(current.id, { reviewStatus: "rejected" });

    const saveMedicines = () => {
      onUpdate(current.id, {
        prescription: parseList(rxDraft),
        patientMedicines: parseList(menDraft),
      });
      setMedSaved(true);
    };

    return (
      <div className="page">
        <button className="link" onClick={() => setOpenId(null)} style={{ fontSize: 16 }}>
          ← Back to all patients
        </button>

        <h2 style={{ marginTop: 12, marginBottom: 4 }}>{current.name || "Patient"}</h2>
        <p style={{ ...LABEL, fontSize: 16 }}>
          Token {current.token ?? "none"} · {formatTime(current.createdAt)} ·{" "}
          {specialtyName("en", current.specialty)}
        </p>

        {(current.urgency === "emergency" || current.aiRedFlag) && (
          <div style={{ ...CARD, background: "#fdecec", border: "2px solid #c1272d" }}>
            <strong style={{ color: "#c1272d", fontSize: 17 }}>
              Possible emergency. Please check this patient now.
            </strong>
          </div>
        )}

        <div style={CARD}>
          <strong style={{ fontSize: 17 }}>What the patient said</strong>
          <p style={LABEL}>Written in {langName(current.language)}</p>
          <p dir="auto" style={{ ...TEXT, fontSize: 18 }}>{current.problem}</p>
        </div>

        <div style={CARD}>
          <strong style={{ fontSize: 17 }}>Summary</strong>
          <p style={LABEL}>{sourceText}</p>
          <p style={{ ...TEXT, fontSize: 18 }}>{shown}</p>
          <p style={LABEL}>How sure the AI is: {CONF_WORD[confidence]}</p>

          {!editing && (
            <button
              onClick={startEdit}
              style={{ ...BIG_BUTTON, background: "#f2f2f2", color: "#222" }}
            >
              Edit summary
            </button>
          )}

          {editing && (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={TEXTAREA} />
              {warning && <p style={{ color: "#c1272d", fontSize: 15 }}>{warning}</p>}
              <button onClick={saveEdit} style={{ ...BIG_BUTTON, background: BURGUNDY, color: "#fff" }}>
                Save summary
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{ ...BIG_BUTTON, background: "#f2f2f2", color: "#222" }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {!editing && (
          <div style={CARD}>
            <strong style={{ fontSize: 17 }}>Your decision</strong>
            <button onClick={approve} style={{ ...BIG_BUTTON, background: BURGUNDY, color: "#fff" }}>
              Approve
            </button>
            <button onClick={reject} style={{ ...BIG_BUTTON, background: "#fff", color: "#c1272d", border: "2px solid #c1272d" }}>
              Reject
            </button>
          </div>
        )}

        <details style={CARD}>
          <Attachments title="Patient reports" files={current.attachments || []} canAdd={false} />
          <SuggestionReview record={current} onUpdate={onUpdate} />
          <summary style={{ fontSize: 17, fontWeight: 600, cursor: "pointer" }}>Show more</summary>

          <div style={{ marginTop: 14 }}>
            <strong>Medicines</strong>
            <p style={LABEL}>Type names separated by commas.</p>
            <p style={{ ...LABEL, marginTop: 8 }}>Your prescription</p>
            <textarea
              value={rxDraft}
              onChange={(e) => {
                setRxDraft(e.target.value);
                setMedSaved(false);
              }}
              style={TEXTAREA}
            />
            <p style={{ ...LABEL, marginTop: 8 }}>Medicines the patient mentioned</p>
            <textarea
              value={menDraft}
              onChange={(e) => {
                setMenDraft(e.target.value);
                setMedSaved(false);
              }}
              style={TEXTAREA}
            />
            <button onClick={saveMedicines} style={{ ...BIG_BUTTON, background: "#f2f2f2", color: "#222" }}>
              Save medicines
            </button>
            {medSaved && <p style={LABEL}>Saved.</p>}
            {cmp.mentionedOnly.length > 0 && (
              <p style={{ ...TEXT, color: "#c1272d" }}>
                Ask the patient about: {cmp.mentionedOnly.join(", ")}
              </p>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Missing information</strong>
            <p style={TEXT}>{summary.missing.length ? summary.missing.join(", ") : "Nothing missing"}</p>
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Language</strong>
            {translation.status === "same_language" && (
              <p style={TEXT}>The patient wrote in your language.</p>
            )}
            {translation.status === "needs_interpreter" && (
              <p style={TEXT}>
                Automatic translation is not ready yet. Please read the original words above, or ask an
                interpreter to check.
              </p>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <strong>Messages with the patient</strong>
            <Chat
              title="Chat"
              sender="doctor"
              messages={current.messages || []}
              onSend={(list) => onUpdate(current.id, { messages: list })}
            />
          </div>
        </details>
      </div>
    );
  }

  // ----- List of patients -----
  const sorted = [...records].sort((a, b) => ORDER[a.urgency] - ORDER[b.urgency]);

  return (
    <div className="page">
      <h2 style={{ marginBottom: 4 }}>Your patients</h2>
      <p style={{ ...LABEL, fontSize: 16 }}>{records.length} today</p>

      {alerts.length > 0 && (
        <div style={{ ...CARD, background: "#fdecec", border: "2px solid #c1272d" }}>
          <strong style={{ color: "#c1272d", fontSize: 17 }}>
            {alerts.length} emergency alert{alerts.length > 1 ? "s" : ""}
          </strong>
        </div>
      )}

      {sorted.length === 0 && <p style={{ ...TEXT, marginTop: 20 }}>No patients yet.</p>}

      {sorted.map((r) => (
        <button
          key={r.id}
          onClick={() => openRecord(r)}
          style={{
            ...CARD,
            width: "100%",
            textAlign: "left",
            border: "none",
            cursor: "pointer",
            display: "block",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 18 }}>{r.name || "Patient"}</strong>
              <p style={LABEL}>
                Token {r.token ?? "none"} · {formatTime(r.createdAt)} · {specialtyName("en", r.specialty)}
              </p>
            </div>
            <span
              style={{
                fontWeight: 600,
                color: r.urgency === "emergency" ? "#c1272d" : BURGUNDY,
                fontSize: 15,
              }}
            >
              {statusWord(r)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
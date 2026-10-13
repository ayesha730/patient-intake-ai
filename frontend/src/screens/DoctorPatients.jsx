import { useState } from "react";
import { buildSummary, checkOutput } from "../lib/summary";
import { specialtyName } from "../lib/specialties";
import { translateText } from "../lib/translate";
import { LANGUAGES } from "../lib/i18n";
import { parseList, compareLists } from "../lib/medicines";
import Chat from "../components/Chat";

const ORDER = { emergency: 0, uncertain: 1, normal: 2 };
const URGENCY_LABEL = { emergency: "Emergency", uncertain: "Check", normal: "Normal" };
const URGENCY_CLASS = { emergency: "urgent", uncertain: "review", normal: "info" };
const CONF_LABEL = { high: "High", medium: "Medium", low: "Low" };
const CONF_CLASS = { high: "info", medium: "review", low: "urgent" };
const GENDER_LABEL = { male: "Male", female: "Female", other: "Other" };
const REVIEW_LABEL = {
  pending: "Waiting for review",
  approved: "Approved",
  edited: "Edited and approved",
  rejected: "Rejected",
};
const TEXTAREA = {
  width: "100%",
  minHeight: 70,
  marginTop: 8,
  borderRadius: 12,
  border: "1px solid #ddd",
  padding: 10,
  fontFamily: "inherit",
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function langName(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? found.label : code;
}

export default function DoctorPatients({ records = [], alerts = [], onUpdate, profile }) {
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState("");
  const [rxDraft, setRxDraft] = useState("");
  const [mentionDraft, setMentionDraft] = useState("");
  const [rxSaved, setRxSaved] = useState(false);

  const doctorLang = (profile && profile.language) || "en";
  const current = records.find((r) => r.id === openId);

  const needsInterpreter = (r) =>
    translateText(r.problem, r.language, doctorLang).status === "needs_interpreter";

  const openRecord = (r) => {
    setOpenId(r.id);
    setEditing(false);
    setWarning("");
    setRxDraft((r.prescription || []).join(", "));
    setMentionDraft((r.patientMedicines || []).join(", "));
    setRxSaved(false);
  };

  const closeDetail = () => {
    setOpenId(null);
    setEditing(false);
    setWarning("");
  };

  // ----- Detail view for one patient -----
  if (current) {
    const summary = buildSummary(current);
    const shown = current.summary || summary.restated;
    const translation = translateText(current.problem, current.language, doctorLang);
    const savedRx = current.prescription || [];
    const savedMen = current.patientMedicines || [];
    const cmp = compareLists(savedRx, savedMen);

    const startEdit = () => {
      setDraft(shown);
      setWarning("");
      setEditing(true);
    };

    const saveEdit = () => {
      const hit = checkOutput(draft);
      if (hit) {
        setWarning(`Not saved: the text contains diagnostic wording ("${hit}"). Keep to what the patient said.`);
        return;
      }
      onUpdate(current.id, { summary: draft, reviewStatus: "edited" });
      setEditing(false);
      setWarning("");
    };

    const saveMedicines = () => {
      onUpdate(current.id, {
        prescription: parseList(rxDraft),
        patientMedicines: parseList(mentionDraft),
      });
      setRxSaved(true);
    };

    const approve = () => onUpdate(current.id, { reviewStatus: "approved" });
    const reject = () => onUpdate(current.id, { reviewStatus: "rejected" });

    return (
      <div className="page">
        <button className="link" onClick={closeDetail}>← Back to patients</button>

        <h2 style={{ marginTop: 12 }}>{current.name || "Patient"}</h2>
        <p className="muted">
          Token {current.token ?? "—"} · Age {current.age ?? "—"} · {GENDER_LABEL[current.gender] || "—"}
        </p>
        <p className="muted">
          {formatTime(current.createdAt)} · {specialtyName("en", current.specialty)} ·{" "}
          {REVIEW_LABEL[current.reviewStatus || "pending"]}
        </p>
        <span className={`badge ${URGENCY_CLASS[current.urgency]}`}>{URGENCY_LABEL[current.urgency]}</span>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <div className="card-box" style={{ flex: 1, minWidth: 160, marginTop: 0 }}>
            <strong>AI summary</strong>
            <br />
            <span className={`badge ${CONF_CLASS[summary.confidence]}`}>
              Confidence: {CONF_LABEL[summary.confidence]}
            </span>

            {editing ? (
              <>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={TEXTAREA} />
                {warning && <p style={{ color: "#c1272d", fontSize: 13 }}>{warning}</p>}
                <div className="chips">
                  <button className="chip on" onClick={saveEdit}>Save</button>
                  <button className="chip" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <p style={{ marginTop: 10, lineHeight: 1.5 }}>{shown}</p>
            )}
          </div>

          <div className="card-box" style={{ flex: 1, minWidth: 160, marginTop: 0 }}>
            <strong>Patient's original words</strong>
            <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
              Written in {langName(current.language)}
            </p>
            <p dir="auto" style={{ marginTop: 10, lineHeight: 1.5 }}>{current.problem}</p>
          </div>
        </div>

        <div className="card-box">
          <strong>Reading in {langName(doctorLang)}</strong>
          {translation.status === "same_language" && (
            <p className="muted" style={{ margin: "6px 0 0" }}>
              The patient wrote in your language.
            </p>
          )}
          {translation.status === "needs_interpreter" && (
            <>
              <p style={{ margin: "8px 0" }}>
                <span className="badge review">Needs interpreter review</span>
              </p>
              <p className="muted" style={{ margin: 0 }}>
                Automatic translation is not connected yet. Read the original words above, or ask an
                interpreter to check before you approve.
              </p>
            </>
          )}
        </div>

        <div className="card-box">
          <strong>Missing information</strong>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {summary.missing.length ? summary.missing.join(", ") : "None"}
          </p>
        </div>

        <div className="card-box">
          <strong>Medicine check</strong>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
            Type the names yourself, separated by commas. The app only compares the two lists. It is a checklist for you, not a diagnosis.
          </p>

          <p style={{ margin: "10px 0 0", fontSize: 13 }}>Your prescription</p>
          <textarea
            value={rxDraft}
            onChange={(e) => {
              setRxDraft(e.target.value);
              setRxSaved(false);
            }}
            placeholder="Example: Paracetamol 500mg, Omeprazole 20mg"
            style={TEXTAREA}
          />

          <p style={{ margin: "10px 0 0", fontSize: 13 }}>Medicines the patient mentioned</p>
          <textarea
            value={mentionDraft}
            onChange={(e) => {
              setMentionDraft(e.target.value);
              setRxSaved(false);
            }}
            placeholder="Example: Panadol, a cough syrup"
            style={TEXTAREA}
          />

          <div className="chips" style={{ marginTop: 8 }}>
            <button className="chip on" onClick={saveMedicines}>Save medicines</button>
          </div>
          {rxSaved && <p className="muted" style={{ margin: "6px 0 0" }}>Saved.</p>}

          {savedRx.length === 0 && savedMen.length === 0 ? (
            <p className="muted" style={{ margin: "10px 0 0" }}>No medicines saved yet.</p>
          ) : (
            <div style={{ marginTop: 12, lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>
                <strong>In both lists:</strong> {cmp.both.length ? cmp.both.join(", ") : "None"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Prescribed, not mentioned by patient:</strong>{" "}
                {cmp.prescribedOnly.length ? cmp.prescribedOnly.join(", ") : "None"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Mentioned by patient, not prescribed:</strong>{" "}
                {cmp.mentionedOnly.length ? cmp.mentionedOnly.join(", ") : "None"}
              </p>
              {cmp.mentionedOnly.length > 0 && (
                <p className="muted" style={{ margin: "8px 0 0", fontSize: 12 }}>
                  Ask the patient about these medicines before you approve.
                </p>
              )}
            </div>
          )}
        </div>

        <Chat
          title="Message the patient"
          sender="doctor"
          messages={current.messages || []}
          onSend={(list) => onUpdate(current.id, { messages: list })}
        />

        {!editing && (
          <>
            <button className="btn solid" onClick={approve}>APPROVE</button>
            <div className="chips" style={{ marginTop: 12 }}>
              <button className="chip" onClick={startEdit}>Edit</button>
              <button className="chip" onClick={reject}>Reject</button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ----- Patient list -----
  const sorted = [...records].sort((a, b) => ORDER[a.urgency] - ORDER[b.urgency]);
  const interpreterCount = records.filter(needsInterpreter).length;

  return (
    <div className="page">
      <h2>Patients</h2>
      <p className="muted">
        {records.length} today
        {interpreterCount > 0 && ` · ${interpreterCount} need an interpreter`}
      </p>

      {alerts.length > 0 && (
        <div className="card-box" style={{ background: "#fdecec", border: "1px solid #c1272d" }}>
          <strong style={{ color: "#c1272d" }}>Staff alerts ({alerts.length})</strong>
          {alerts.map((a, i) => (
            <p key={i} className="muted" style={{ margin: "6px 0 0" }}>
              {formatTime(a.time)} · {a.problem}
            </p>
          ))}
        </div>
      )}

      {sorted.length === 0 && <p className="muted">No patients yet.</p>}

      {sorted.map((r) => (
        <button
          key={r.id}
          className="card-box"
          style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", display: "block" }}
          onClick={() => openRecord(r)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{r.name || "Patient"}</strong>{" "}
              <span className="muted">Token {r.token ?? "—"}</span>
              <p className="muted" style={{ margin: "2px 0 0" }}>
                {formatTime(r.createdAt)} · {specialtyName("en", r.specialty)}
              </p>
              {needsInterpreter(r) && (
                <span className="badge review" style={{ marginTop: 6 }}>Needs interpreter</span>
              )}
            </div>
            <span className={`badge ${URGENCY_CLASS[r.urgency]}`}>{URGENCY_LABEL[r.urgency]}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
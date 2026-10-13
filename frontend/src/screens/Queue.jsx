import { translateText } from "../lib/translate";
import { compareLists } from "../lib/medicines";

const ORDER = { emergency: 0, uncertain: 1, normal: 2 };
const URGENCY_LABEL = { emergency: "Emergency", uncertain: "Check", normal: "Normal" };
const URGENCY_CLASS = { emergency: "urgent", uncertain: "review", normal: "info" };
const WHO_LABEL = { doctor: "Doctor", patient: "Patient" };

function formatTime(iso) {
  return new Date(iso).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Reasons this patient needs attention. Only the reason text is shown, never the full words.
function reasonsFor(r, doctorLang) {
  const reasons = [];
  if (r.urgency === "emergency") reasons.push({ text: "Emergency", cls: "urgent" });
  if (!r.reviewStatus || r.reviewStatus === "pending") {
    reasons.push({ text: "Waiting for review", cls: "review" });
  }
  if (translateText(r.problem, r.language, doctorLang).status === "needs_interpreter") {
    reasons.push({ text: "Needs interpreter", cls: "review" });
  }
  const cmp = compareLists(r.prescription || [], r.patientMedicines || []);
  if (cmp.mentionedOnly.length > 0) reasons.push({ text: "Medicine to check", cls: "review" });
  const msgs = r.messages || [];
  if (msgs.length > 0 && msgs[msgs.length - 1].from === "patient") {
    reasons.push({ text: "Patient message", cls: "urgent" });
  }
  return reasons;
}

export default function StaffQueue({ records = [], audit = [], profile }) {
  const doctorLang = (profile && profile.language) || "en";

  // Open cases: emergencies always, plus anything not yet approved or rejected
  const open = records.filter(
    (r) => r.urgency === "emergency" || !["approved", "rejected"].includes(r.reviewStatus || "pending")
  );

  const ordered = [...open].sort((a, b) => {
    const byUrgency = ORDER[a.urgency] - ORDER[b.urgency];
    if (byUrgency !== 0) return byUrgency;
    return (a.token ?? 9999) - (b.token ?? 9999);
  });

  const recentLog = [...audit].reverse().slice(0, 50);

  return (
    <div className="page">
      <h2>Queue</h2>
      <p className="muted">{ordered.length} waiting</p>

      {ordered.length === 0 && <p className="muted">Nobody is waiting.</p>}

      {ordered.map((r, i) => (
        <div key={r.id} className="card-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>
                #{i + 1} {r.name || "Patient"}
              </strong>{" "}
              <span className="muted">Token {r.token ?? "—"}</span>
              <p className="muted" style={{ margin: "2px 0 0" }}>{formatTime(r.createdAt)}</p>
            </div>
            <span className={`badge ${URGENCY_CLASS[r.urgency]}`}>{URGENCY_LABEL[r.urgency]}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {reasonsFor(r, doctorLang).map((reason) => (
              <span key={reason.text} className={`badge ${reason.cls}`}>{reason.text}</span>
            ))}
          </div>
        </div>
      ))}

      <div className="card-box">
        <strong>Activity log</strong>
        <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
          Newest first. Records who did what and when.
        </p>
        {recentLog.length === 0 && <p className="muted" style={{ marginTop: 8 }}>No activity yet.</p>}
        {recentLog.map((e, i) => (
          <p key={i} style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.4 }}>
            <span className="muted">{formatTime(e.time)}</span>
            <br />
            {WHO_LABEL[e.who] || "System"}: {e.action}
            {e.name ? ` · ${e.name}` : ""}
            {e.token != null ? ` (token ${e.token})` : ""}
          </p>
        ))}
      </div>
    </div>
  );
}
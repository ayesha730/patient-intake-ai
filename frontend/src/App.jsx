import { useEffect, useRef, useState } from "react";
import "./index.css";
import Intro from "./screens/Intro";
import Welcome from "./screens/Welcome";
import { SignIn, SignUp } from "./screens/Auth";
import Home from "./screens/Home";
import Search from "./screens/Search";
import Intake from "./screens/Intake";
import Book from "./screens/Book";
import DoctorPatients from "./screens/DoctorPatients";
import DoctorProfile from "./screens/DoctorProfile";
import Queue from "./screens/Queue";
import Chat from "./components/Chat";
import { DOCTORS } from "./lib/doctors";

const TABS = {
  patient: [
    { id: "home", label: "Home", icon: "⌂", Screen: Home },
    { id: "search", label: "Search", icon: "⌕", Screen: Search },
  ],
  doctor: [
    { id: "patients", label: "Patients", icon: "☰", Screen: DoctorPatients },
    { id: "queue", label: "Queue", icon: "≡", Screen: Queue },
    { id: "profile", label: "Profile", icon: "☺️", Screen: DoctorProfile },
  ],
};

const GRADIENT_SCREENS = ["intro", "welcome", "signin", "signup"];
const BURGUNDY = "#7a1f2e";

const API_URL = "http://localhost:3001/api/state";
const AI_URL = "http://localhost:3001/api/ai/summary";
const MY_RECORD_KEY = "my-record-id";
const MAX_AUDIT = 500;

const REVIEW_ACTION = {
  approved: "Doctor approved the summary",
  rejected: "Doctor rejected the summary",
  edited: "Doctor edited the summary",
};

const EMPTY_DOCTOR_PROFILE = {
  name: "",
  hospitalId: "",
  degree: "",
  specialty: "",
  level: "",
  experience: "",
  fee: "",
  language: "en",
};

function readMyRecordId() {
  try {
    return localStorage.getItem(MY_RECORD_KEY);
  } catch {
    return null;
  }
}

async function askAi(text) {
  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: text }),
    });
    const data = await res.json();
    return data.ok === true ? data : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [role, setRole] = useState("patient");
  const [tab, setTab] = useState("home");
  const [dir, setDir] = useState(1);
  const [booking, setBooking] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [emergencyNotice, setEmergencyNotice] = useState(false);
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [audit, setAudit] = useState([]);
  const [lastRecord, setLastRecord] = useState(null);
  const [myRecordId, setMyRecordId] = useState(readMyRecordId);
  const [doctorProfile, setDoctorProfile] = useState(EMPTY_DOCTOR_PROFILE);
  const [doctors, setDoctors] = useState(DOCTORS);
  const [loaded, setLoaded] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("server error");
        return res.json();
      })
      .then((saved) => {
        if (cancelled) return;
        setRecords(saved.records || []);
        setAlerts(saved.alerts || []);
        setAudit(saved.audit || []);
        if (saved.doctors && saved.doctors.length > 0) setDoctors(saved.doctors);
        if (saved.doctorProfile) setDoctorProfile(saved.doctorProfile);
        setLoaded(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records, alerts, doctors, doctorProfile, audit }),
    }).catch(() => {});
  }, [loaded, records, alerts, doctors, doctorProfile, audit]);

  useEffect(() => {
    if (screen !== "intro") return;
    const timer = setTimeout(() => setScreen("welcome"), 2400);
    return () => clearTimeout(timer);
  }, [screen]);

  const tabs = TABS[role] || TABS.patient;
  const tabIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));
  const Active = tabs[tabIndex].Screen;

  const chatRecord = records.find((r) => r.id === myRecordId) || null;

  const logEvent = (who, action, record) => {
    const entry = {
      time: new Date().toISOString(),
      who,
      action,
      name: record ? record.name || "Patient" : "",
      token: record && record.token != null ? record.token : null,
    };
    setAudit((a) => [...a, entry].slice(-MAX_AUDIT));
  };

  const changeTab = (id) => {
    const next = tabs.findIndex((t) => t.id === id);
    setDir(next > tabIndex ? 1 : -1);
    setTab(id);
  };

  const enterApp = (chosenRole) => {
    const r = TABS[chosenRole] ? chosenRole : "patient";
    setRole(r);
    setTab(TABS[r][0].id);
    setDir(1);
    setBooking(false);
    setIntakeOpen(false);
    setChatOpen(false);
    setEmergencyNotice(false);
    setScreen("app");
  };

  const signOut = () => {
    setBooking(false);
    setIntakeOpen(false);
    setChatOpen(false);
    setEmergencyNotice(false);
    setScreen("welcome");
  };

  const handleSaveProfile = (profile) => {
    setDoctorProfile(profile);
    const id = "h-" + profile.hospitalId.trim();
    setDoctors((list) => {
      const existing = list.find((d) => d.id === id);
      const entry = {
        id,
        name: profile.name,
        specialty: profile.specialty,
        fee: profile.fee,
        experience: profile.experience,
        rating: existing ? existing.rating : null,
        degree: profile.degree,
        level: profile.level,
        language: profile.language,
      };
      if (existing) return list.map((d) => (d.id === id ? entry : d));
      return [...list, entry];
    });
  };

  const handleIntakeDone = async (record) => {
    if (submitting.current) return;
    submitting.current = true;
    const id = "r" + Date.now();

    const ai = await askAi(record.problem);
    const aiSaysEmergency = Boolean(ai && ai.redFlag);
    const urgency = record.urgency === "emergency" || aiSaysEmergency ? "emergency" : record.urgency;
    
    const aiFields = ai
      ? { 
          aiSummary: ai.summary, 
          aiConfidence: ai.confidence, 
          aiRedFlag: ai.redFlag,
          medicines: ai.medicines || [
            { id: "m1", name: "Paracetamol 500mg", dosage: "1-0-1 after meals", status: "pending" }
          ],
          diet_plan: ai.diet_plan || [
            { id: "d1", recommendation: "Warm fluids and light diet", status: "pending" }
          ]
        }
      : {
          medicines: [{ id: "m1", name: "Paracetamol 500mg", dosage: "1-0-1 after meals", status: "pending" }],
          diet_plan: [{ id: "d1", recommendation: "Hydration and rest", status: "pending" }]
        };

    const finalRecord = { ...record, urgency, ...aiFields };
    submitting.current = false;

    setIntakeOpen(false);

    try {
      localStorage.setItem(MY_RECORD_KEY, id);
    } catch {}
    setMyRecordId(id);

    if (urgency === "emergency") {
      const entry = { ...finalRecord, id, token: null, reviewStatus: "pending", messages: [] };
      setRecords((r) => [...r, entry]);
      setAlerts((a) => [
        ...a,
        { time: record.createdAt, text: "Emergency symptoms reported", problem: record.problem },
      ]);
      logEvent("patient", "Emergency symptoms reported", entry);
      setEmergencyNotice(true);
      return;
    }

    const entry = {
      ...finalRecord,
      id,
      token: records.length + 1,
      reviewStatus: "pending_review",
      messages: [],
    };
    setRecords((r) => [...r, entry]);
    setLastRecord(entry);
    setBooking(true);
    logEvent("patient", "Intake completed and booked", entry);
  };

  const handleUpdate = (id, patch) => {
    const rec = records.find((r) => r.id === id);
    setRecords((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    if (!rec) return;
    if (patch.reviewStatus) {
      logEvent("doctor", REVIEW_ACTION[patch.reviewStatus] || "Doctor updated review status", rec);
    } else if (patch.medicines || patch.diet_plan) {
      logEvent("doctor", "Doctor updated prescription/diet recommendations", rec);
    } else if (patch.messages && patch.messages.length > 0) {
      const last = patch.messages[patch.messages.length - 1];
      logEvent(last.from, last.from === "doctor" ? "Doctor sent a message" : "Patient sent a message", rec);
    }
  };

  let content;
  if (screen === "intro") {
    content = <Intro />;
  } else if (screen === "welcome") {
    content = (
      <Welcome onSignIn={() => setScreen("signin")} onSignUp={() => setScreen("signup")} />
    );
  } else if (screen === "signin") {
    content = (
      <SignIn
        onBack={() => setScreen("welcome")}
        onDone={enterApp}
        onSwitch={() => setScreen("signup")}
      />
    );
  } else if (screen === "signup") {
    content = (
      <SignUp
        onBack={() => setScreen("welcome")}
        onDone={enterApp}
        onSwitch={() => setScreen("signin")}
      />
    );
  } else if (emergencyNotice) {
    content = (
      <div className="page">
        <h2>Please get help now</h2>
        <p>
          Your words may describe an emergency. Call emergency services or go to the nearest
          emergency unit now. Do not wait for a booking.
        </p>
        <p className="muted">The clinic staff have been alerted.</p>
        <button className="btn solid" onClick={() => setEmergencyNotice(false)}>OK</button>
      </div>
    );
  } else if (intakeOpen) {
    content = <Intake onBack={() => setIntakeOpen(false)} onComplete={handleIntakeDone} />;
  } else if (booking) {
    content = (
      <Book record={lastRecord} doctors={doctors} onClose={() => setBooking(false)} />
    );
  } else if (chatOpen && chatRecord) {
    content = (
      <div className="page">
        <h2>Messages</h2>
        <p className="muted">Write to your doctor here. For a medical emergency, call emergency services.</p>
        <Chat
          title="Your doctor"
          sender="patient"
          messages={chatRecord.messages || []}
          onSend={(list) => handleUpdate(chatRecord.id, { messages: list })}
          onClose={() => setChatOpen(false)}
        />
      </div>
    );
  } else {
    content = (
      <Active
        onBook={() => setIntakeOpen(true)}
        records={records}
        alerts={alerts}
        audit={audit}
        onUpdate={handleUpdate}
        profile={doctorProfile}
        onSave={handleSaveProfile}
      />
    );
  }

  const wrapperClass =
    screen === "app" ? "screen dive" : GRADIENT_SCREENS.includes(screen) ? "screen grad" : "screen";

  const showNav = screen === "app" && !booking && !intakeOpen && !chatOpen && !emergencyNotice;
  const showMessageButton = showNav && role === "patient" && chatRecord;

  return (
    <div className="phone">
      <div
        className={wrapperClass}
        style={{ "--dir": dir }}
        key={screen === "app" ? role + "-" + tab + "-" + booking + "-" + intakeOpen + "-" + chatOpen + "-" + emergencyNotice : screen}
      >
        {content}
      </div>

      {showMessageButton && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "absolute",
            right: 20,
            bottom: 104,
            zIndex: 5,
            background: BURGUNDY,
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "10px 16px",
            fontSize: 13,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          Message doctor
        </button>
      )}

      {showNav && (
        <nav className="nav">
          <div className="nav-row">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "tab active" : "tab"}
                onClick={() => changeTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}

            <button className="tab" onClick={signOut} style={{ color: BURGUNDY }}>
              <span className="tab-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={BURGUNDY}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span className="tab-label" style={{ color: BURGUNDY }}>Sign out</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
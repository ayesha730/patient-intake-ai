import { useEffect, useState } from "react";
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

const TABS = {
  patient: [
    { id: "home", label: "Home", icon: "⌂", Screen: Home },
    { id: "search", label: "Search", icon: "⌕", Screen: Search },
  ],
  doctor: [
    { id: "patients", label: "Patients", icon: "☰", Screen: DoctorPatients },
    { id: "profile", label: "Profile", icon: "☺️", Screen: DoctorProfile },
  ],
};

const GRADIENT_SCREENS = ["intro", "welcome", "signin", "signup"];

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | welcome | signin | signup | app
  const [role, setRole] = useState("patient");
  const [tab, setTab] = useState("home");
  const [dir, setDir] = useState(1);
  const [booking, setBooking] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [records, setRecords] = useState([]); // every intake, shared with the doctor side later
  const [alerts, setAlerts] = useState([]); // staff alerts for emergency symptoms
  const [lastRecord, setLastRecord] = useState(null);

  useEffect(() => {
    if (screen !== "intro") return;
    const timer = setTimeout(() => setScreen("welcome"), 2400);
    return () => clearTimeout(timer);
  }, [screen]);

  const tabs = TABS[role] || TABS.patient;
  const tabIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));
  const Active = tabs[tabIndex].Screen;

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
    setScreen("app");
  };

  // Called when the patient finishes intake
  const handleIntakeDone = (record) => {
    setIntakeOpen(false);

    if (record.urgency === "emergency") {
      // Booking stops. Record and staff alert are saved, then the patient returns home.
      setRecords((r) => [...r, { ...record, token: null, status: "urgent" }]);
      setAlerts((a) => [
        ...a,
        { time: record.createdAt, text: "Emergency symptoms reported", problem: record.problem },
      ]);
      return;
    }

    const entry = { ...record, token: records.length + 1, status: "waiting" };
    setRecords((r) => [...r, entry]);
    setLastRecord(entry);
    setBooking(true);
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
  } else if (intakeOpen) {
    content = <Intake onBack={() => setIntakeOpen(false)} onComplete={handleIntakeDone} />;
  } else if (booking) {
    content = <Book record={lastRecord} onClose={() => setBooking(false)} />;
  } else {
    content = <Active onBook={() => setIntakeOpen(true)} />;
  }

  const wrapperClass =
    screen === "app" ? "screen dive" : GRADIENT_SCREENS.includes(screen) ? "screen grad" : "screen";

  const showNav = screen === "app" && !booking && !intakeOpen;

  return (
    <div className="phone">
      <div
        className={wrapperClass}
        style={{ "--dir": dir }}
        key={screen === "app" ? `${role}-${tab}-${booking}-${intakeOpen}` : screen}
      >
        {content}
      </div>

      {showNav && (
        <nav className="nav">
          <div className="nav-row">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`tab ${tab === t.id ? "active" : ""}`}
                onClick={() => changeTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
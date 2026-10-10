import { useEffect, useState } from "react";
import "./index.css";
import Intro from "./screens/Intro";
import Welcome from "./screens/Welcome";
import { SignIn, SignUp } from "./screens/Auth";
import Home from "./screens/Home";
import Search from "./screens/Search";
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

export default function App() {
  const [screen, setScreen] = useState("intro"); // intro | welcome | signin | signup | app
  const [role, setRole] = useState("patient");
  const [tab, setTab] = useState("home");
  const [dir, setDir] = useState(1); // 1 = moving right, -1 = moving left
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (screen !== "intro") return;
    const timer = setTimeout(() => setScreen("welcome"), 2400);
    return () => clearTimeout(timer);
  }, [screen]);

  const tabs = TABS[role];
  const tabIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));
  const Active = tabs[tabIndex].Screen;
  const gradientScreens = ["intro", "welcome", "signin", "signup"];

  const changeTab = (id) => {
    const next = tabs.findIndex((t) => t.id === id);
    setDir(next > tabIndex ? 1 : -1);
    setTab(id);
  };

  const enterApp = (chosenRole) => {
    setRole(chosenRole);
    setTab(TABS[chosenRole][0].id);
    setDir(1);
    setBooking(false);
    setScreen("app");
  };

  let content;
  if (screen === "intro") content = <Intro />;
  else if (screen === "welcome")
    content = <Welcome onSignIn={() => setScreen("signin")} onSignUp={() => setScreen("signup")} />;
  else if (screen === "signin")
    content = <SignIn onBack={() => setScreen("welcome")} onDone={enterApp} onSwitch={() => setScreen("signup")} />;
  else if (screen === "signup")
    content = <SignUp onBack={() => setScreen("welcome")} onDone={enterApp} onSwitch={() => setScreen("signin")} />;
  else if (booking) content = <Book onClose={() => setBooking(false)} />;
  else content = <Active onBook={() => setBooking(true)} />;

  const wrapperClass =
    screen === "app" ? "screen dive" : gradientScreens.includes(screen) ? "screen grad" : "screen";

  return (
    <div className="phone">
      <div
        className={wrapperClass}
        style={{ "--dir": dir }}
        key={screen === "app" ? `${role}-${tab}-${booking}` : screen}
      >
        {content}
      </div>

      {screen === "app" && !booking && (
        <nav className="nav">
          <div className="nav-row">
            <div className="jumper" style={{ left: `${tabIndex * 50}%` }}>
              <span className="jump-dot" />
            </div>

            {tabs.map((t) => (
              <button
                key={t.id}
                className={tab `${tab === t.id ? "active" : ""}`}
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
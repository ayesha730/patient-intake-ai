import { useState } from "react";

export function SignIn({ onBack, onDone, onSwitch }) {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const identifier = role === "patient" ? email.trim() : hospitalId.trim();

    if (!identifier || !password) {
      setError(
        role === "patient"
          ? "Please enter your email and password."
          : "Please enter your Hospital ID and password."
      );
      return;
    }

    setError("");
    onDone(role);
  };

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={onBack} aria-label="Go back">←</button>
        <h1>Hello<br />Sign in!</h1>
      </div>

      <div className="sheet">
        <div className="role-toggle">
          <button
            className={role === "patient" ? "on" : ""}
            onClick={() => {
              setRole("patient");
              setError("");
            }}
          >
            Patient
          </button>
          <button
            className={role === "doctor" ? "on" : ""}
            onClick={() => {
              setRole("doctor");
              setError("");
            }}
          >
            Doctor
          </button>
        </div>

        {role === "patient" ? (
          <>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        ) : (
          <>
            <label>Hospital ID</label>
            <input
              placeholder="Given by your hospital"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
            />
          </>
        )}

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{error}</p>}

        <button className="btn solid" onClick={handleSubmit}>SIGN IN</button>

        <p style={{ textAlign: "right", fontSize: 13, marginTop: 40 }}>
          Don't have an account?{" "}
          <button className="link" onClick={onSwitch}>Sign up</button>
        </p>
      </div>
    </>
  );
}

export function SignUp({ onBack, onDone, onSwitch }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !contact.trim()) {
      setError("Please fill in your name and phone or email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    onDone("patient");
  };

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={onBack} aria-label="Go back">←</button>
        <h1>Create Your<br />Patient Account</h1>
      </div>

      <div className="sheet">
        <label>Full name</label>
        <input
          placeholder="John Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Phone or email</label>
        <input
          placeholder="+92 300 0000000"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 8 }}>{error}</p>}

        <button className="btn solid" onClick={handleSubmit}>SIGN UP</button>

        <p style={{ textAlign: "right", fontSize: 13, marginTop: 36 }}>
          Already have an account?{" "}
          <button className="link" onClick={onSwitch}>Sign in</button>
        </p>
      </div>
    </>
  );
}
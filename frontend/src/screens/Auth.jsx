import { useState } from "react";

export function SignIn({ onBack, onDone, onSwitch }) {
  const [role, setRole] = useState("patient");

  return (
    <>
      <div className="top grad">
        <button className="back" onClick={onBack}>←</button>
        <h1>Hello<br />Sign in!</h1>
      </div>
      <div className="sheet">
        <div className="role-toggle">
          <button className={role === "patient" ? "on" : ""} onClick={() => setRole("patient")}>Patient</button>
          <button className={role === "doctor" ? "on" : ""} onClick={() => setRole("doctor")}>Doctor</button>
        </div>

        {role === "patient" ? (
          <>
            <label>Email</label>
            <input type="email" placeholder="you@email.com" />
          </>
        ) : (
          <>
            <label>Hospital ID</label>
            <input placeholder="Given by your hospital" />
          </>
        )}

        <label>Password</label>
        <input type="password" placeholder="••••••••" />

        <button className="btn solid" onClick={() => onDone(role)}>SIGN IN</button>

        <p style={{ textAlign: "right", fontSize: 13, marginTop: 40 }}>
          Don't have an account?{" "}
          <button className="link" onClick={onSwitch}>Sign up</button>
        </p>
      </div>
    </>
  );
}

export function SignUp({ onBack, onDone, onSwitch }) {
  return (
    <>
      <div className="top grad">
        <button className="back" onClick={onBack}>←</button>
        <h1>Create Your<br />Patient Account</h1>
      </div>
      <div className="sheet">
        <label>Full name</label>
        <input placeholder="John Smith" />

        <label>Phone or email</label>
        <input placeholder="+92 300 0000000" />

        <label>Password</label>
        <input type="password" />

        <label>Confirm password</label>
        <input type="password" />

        <button className="btn solid" onClick={() => onDone("patient")}>SIGN UP</button>

        <p style={{ textAlign: "right", fontSize: 13, marginTop: 36 }}>
          Already have an account?{" "}
          <button className="link" onClick={onSwitch}>Sign in</button>
        </p>
      </div>
    </>
  );
}
export default function Welcome({ onSignIn, onSignUp }) {
  return (
    <div className="hero">
      <div className="logo">🩺</div>
      <div className="brand">DocAssist AI</div>

      <h1>Welcome Back</h1>
      <p className="muted">Book, describe your problem, and get your token.</p>

      <button className="btn outline" onClick={onSignIn}>SIGN IN</button>
      <button className="btn light" onClick={onSignUp}>SIGN UP</button>

      <p className="social-label">Login with social media</p>
      <div className="socials">
        <span>G</span>
        <span>f</span>
        <span>@</span>
      </div>
    </div>
  );
}
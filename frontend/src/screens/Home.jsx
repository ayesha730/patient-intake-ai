export default function Home({ onBook }) {
  return (
    <div className="page">
      <h2>Hello, Patient</h2>
      <p className="muted">Here's your visit overview.</p>

      <div className="card-box feature">
        <div style={{ fontSize: 13, opacity: 0.8 }}>Next appointment</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Mon, 12 Oct · 10:30 AM</div>
        <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>Your token number: 3</div>
      </div>

      <div className="card-box">
        <strong>Start a new visit</strong>
        <p className="muted" style={{ margin: "6px 0 14px" }}>Describe your problem in your own language.</p>
        <button className="btn solid" style={{ marginTop: 0 }} onClick={onBook}>Book appointment</button>
      </div>
    </div>
  );
}
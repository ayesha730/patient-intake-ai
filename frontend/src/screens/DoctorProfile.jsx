export default function DoctorProfile() {
  return (
    <div className="page">
      <h2>Your profile</h2>
      <p className="muted">Shown to patients when they choose a doctor.</p>

      <div className="card-box">
        <label>Hospital ID</label>
        <input value="H-1001" readOnly />

        <label>Degree</label>
        <input placeholder="MBBS" />

        <label>Level</label>
        <input placeholder="Senior" />

        <label>Experience (years)</label>
        <input type="number" placeholder="8" />

        <label>Consultation fee (Rs)</label>
        <input type="number" placeholder="1500" />

        <button className="btn solid">SAVE PROFILE</button>
      </div>
    </div>
  );
}
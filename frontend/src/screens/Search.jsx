import { useState } from "react";

const DOCTORS = [
  { name: "Dr. Sara Khan", specialty: "General Physician", fee: 1500, rating: 4.7 },
  { name: "Dr. Ali Raza", specialty: "Cardiology", fee: 3000, rating: 4.9 },
  { name: "Dr. Maria Iqbal", specialty: "General Physician", fee: 1000, rating: 4.5 },
  { name: "Dr. Omar Sheikh", specialty: "Dermatology", fee: 2000, rating: 4.6 },
];

const SPECIALTIES = ["All", "General Physician", "Cardiology", "Dermatology"];

export default function Search() {
  const [specialty, setSpecialty] = useState("All");
  const [query, setQuery] = useState("");

  const shown = DOCTORS.filter(
    (d) =>
      (specialty === "All" || d.specialty === specialty) &&
      d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <h2>Find a doctor</h2>
      <input
        className="search-input"
        placeholder="Search by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="chips">
        {SPECIALTIES.map((s) => (
          <button key={s} className={`chip ${specialty === s ? "on" : ""}`} onClick={() => setSpecialty(s)}>
            {s}
          </button>
        ))}
      </div>

      {shown.map((d) => (
        <div className="card-box" key={d.name}>
          <div className="doc-row">
            <div>
              <strong>{d.name}</strong>
              <div className="muted">{d.specialty}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="price">Rs {d.fee}</div>
              <div className="muted">★ {d.rating}</div>
            </div>
          </div>
        </div>
      ))}

      {shown.length === 0 && <p className="muted">No doctors match.</p>}
    </div>
  );
}
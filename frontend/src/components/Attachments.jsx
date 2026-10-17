import { useRef, useState } from "react";

const MAX_BYTES = 3 * 1024 * 1024;
const BURGUNDY = "#7a1f2e";

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Shows files attached to a patient's record. Only the doctor sees them. The AI never gets them.
export default function Attachments({ files = [], canAdd = false, onAdd, title = "Files" }) {
  const input = useRef(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setNote("");
    if (file.size > MAX_BYTES) {
      setNote("This file is too large. Please use a file under 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      onAdd([
        ...files,
        {
          id: "f" + Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          time: new Date().toISOString(),
        },
      ]);
    } catch {
      setNote("Could not read this file. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-box" style={{ marginBottom: 12 }}>
      <strong style={{ fontSize: 16 }}>{title}</strong>
      <p className="muted" style={{ fontSize: 13, margin: "4px 0 8px" }}>
        Only the doctor can see these files. The AI does not read them.
      </p>

      {files.length === 0 && <p style={{ fontSize: 15 }}>No files yet.</p>}

      {files.map((f) => (
        <div key={f.id} style={{ borderTop: "1px solid #eee", padding: "6px 0" }}>
          <a href={f.dataUrl} download={f.name} style={{ color: BURGUNDY, fontWeight: 600, fontSize: 15 }}>
            {f.name}
          </a>
          <div className="muted" style={{ fontSize: 13 }}>
            {Math.round(f.size / 1024) + " KB, " + new Date(f.time).toLocaleString()}
          </div>
        </div>
      ))}

      {canAdd && (
        <>
          <input
            ref={input}
            type="file"
            accept="image/*,application/pdf"
            onChange={pick}
            style={{ display: "none" }}
          />
          <button
            onClick={() => input.current && input.current.click()}
            disabled={busy}
            style={{
              width: "100%",
              marginTop: 8,
              padding: 12,
              borderRadius: 12,
              border: "none",
              background: BURGUNDY,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {busy ? "Adding..." : "Attach report (photo or PDF)"}
          </button>
        </>
      )}

      {note && <p style={{ color: "#c1272d", fontSize: 14 }}>{note}</p>}
    </div>
  );
}
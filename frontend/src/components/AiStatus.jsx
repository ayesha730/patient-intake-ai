import { useEffect, useState } from "react";

// Shows whether the AI is connected, and which model runs it
export default function AiStatus() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/ai/status")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ configured: false }));
  }, []);

  if (!info) return null;

  return (
    <div style={{ fontSize: 11, textAlign: "center", padding: 4, color: "#555" }}>
      {info.configured
        ? "AI running on " + info.provider + " (" + info.model + ")"
        : "AI offline: rule-based checks only"}
    </div>
  );
}
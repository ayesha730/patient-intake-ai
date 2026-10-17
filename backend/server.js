// Local data server. Stores patient and doctor data in backend/data.json
// and forwards AI requests to Token Factory (through ai.js).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { askModel, parseJson, SUMMARY_PROMPT, isConfigured } = require("./ai");

const PORT = process.env.PORT || 3001;

const DATA_FILE = path.join(__dirname, "data.json");
const EMPTY = { records: [], alerts: [], doctors: [], doctorProfile: null, audit: [] };
const MAX_AUDIT = 500;
const SPECIALTIES = ["General Physician", "Cardiology", "Dermatology"];
// Serves the built app (frontend/dist) when the app is live
const STATIC_DIR = path.join(__dirname, "..", "frontend", "dist");
const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function serveFrontend(req, res) {
  const cleanPath = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(STATIC_DIR, cleanPath);
  if (!file.startsWith(STATIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(STATIC_DIR, "index.html");
  }
  if (!fs.existsSync(file)) return send(res, 404, { error: "not found" });
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

// The AI talks to the patient and proposes medicine and food. A doctor approves or rejects every suggestion.
const PROMPT = [
  "You are a health information helper before a clinic visit. You are not a doctor.",
  "Reply in the same language the patient uses.",
  "Ask at most one short question at a time, about how long the problem has lasted, how severe it is from 1 to 10, and any other symptoms.",
  "Never name a disease or diagnosis.",
  "Your reply text must not name any medicine or food. Put those only in the suggestions list.",
  "If the patient describes a possible emergency (for example chest pain, trouble breathing, fainting, heavy bleeding, stroke signs), set red_flag to true and tell them to call emergency services now.",
  "When you have enough information, or the patient asks for a result, set done to true.",
  "When done is true, write a short reply that repeats what you understood, says which doctor to see, and says a doctor will check any medicine and food suggestions before they are shown to the patient.",
  "When done is true, fill suggestions with up to 4 medicines, up to 4 foods, and up to 2 medical tests a doctor could consider (for example a blood test). Test names are general, with no instructions on how to interpret results.",
  "When done is false, suggestions must be an empty list.",
  'Reply with JSON only, in this form: {"reply": "your message", "specialty": "General Physician", "red_flag": false, "done": false, "suggestions": [{"type": "medicine", "name": "name", "reason": "why"}]}',
  "Use specialty General Physician, Cardiology, or Dermatology when done is true. Otherwise use null.",
].join(" ");

function readState() {
  try {
    return { ...EMPTY, ...JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) };
  } catch {
    return { ...EMPTY };
  }
}

function writeState(state) {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

function send(res, code, body) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (code === 204) return res.end();
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20000000) {
        req.destroy();
        reject(new Error("too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// Keeps only well-formed suggestions and limits their size
function cleanSuggestions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => s && (s.type === "medicine" || s.type === "food" || s.type === "test")
    .slice(0, 8)
    .map((s) => ({
      type: s.type,
      name: String(s.name).trim().slice(0, 60),
      reason: String(s.reason || "").trim().slice(0, 200),
    })));
}

// Summary for the doctor, written when the patient finishes intake
async function handleSummary(req, res) {
  let input;
  try {
    input = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "bad data" });
  }

  const text = String(input.problem || "").slice(0, 2000);
  if (!text.trim()) return send(res, 400, { error: "no text" });
  if (!isConfigured()) return send(res, 200, { ok: false, reason: "AI is not set up yet" });

  const reply = await askModel(SUMMARY_PROMPT, text);
  const parsed = parseJson(reply);
  if (!parsed) return send(res, 200, { ok: false, reason: "AI did not answer" });

  send(res, 200, {
    ok: true,
    summary: String(parsed.summary || "").slice(0, 500),
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low",
    redFlag: parsed.red_flag === true,
  });
}

// Chat before booking: the patient and the AI talk, one question at a time
async function handleChat(req, res) {
  let input;
  try {
    input = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "bad data" });
  }

  const list = Array.isArray(input.messages) ? input.messages.slice(-12) : [];
  const transcript = list
    .map((m) => (m.from === "ai" ? "AI" : "Patient") + ": " + String(m.text || "").slice(0, 1000))
    .join("\n");
  if (!transcript.trim()) return send(res, 400, { error: "no text" });
  if (!isConfigured()) return send(res, 200, { ok: false, reason: "AI is not set up yet" });

  const reply = await askModel(CHAT_PROMPT, transcript);
  const parsed = parseJson(reply);
  if (!parsed) return send(res, 200, { ok: false, reason: "AI did not answer" });

  const done = parsed.done === true;
  send(res, 200, {
    ok: true,
    reply: String(parsed.reply || "").slice(0, 1200),
    specialty: SPECIALTIES.includes(parsed.specialty) ? parsed.specialty : null,
    redFlag: parsed.red_flag === true,
    done,
    suggestions: done ? cleanSuggestions(parsed.suggestions) : [],
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  if (req.method === "GET" && !req.url.startsWith("/api/")) return serveFrontend(req, res);
  if (req.url === "/api/ai/status" && req.method === "GET") {
    return send(res, 200, {
      configured: isConfigured(),
      provider: "AMD Token Factory",
      model: process.env.TOKEN_FACTORY_MODEL || "unknown",
    });
  }
  
  if (req.url === "/api/ai/summary" || req.url === "/api/ai/chat") {
    if (req.method !== "POST") return send(res, 405, { error: "method not allowed" });
    const handler = req.url === "/api/ai/chat" ? handleChat : handleSummary;
    return handler(req, res).catch(() => send(res, 500, { error: "server error" }));
  }


  if (req.url !== "/api/state") return send(res, 404, { error: "not found" });

  if (req.method === "GET") return send(res, 200, readState());

  if (req.method === "PUT") {
    readBody(req)
      .then((body) => {
        const incoming = JSON.parse(body);
        writeState({
          records: Array.isArray(incoming.records) ? incoming.records : [],
          alerts: Array.isArray(incoming.alerts) ? incoming.alerts : [],
          doctors: Array.isArray(incoming.doctors) ? incoming.doctors : [],
          doctorProfile: incoming.doctorProfile || null,
          audit: Array.isArray(incoming.audit) ? incoming.audit.slice(-MAX_AUDIT) : [],
        });
        send(res, 200, { ok: true });
      })
      .catch(() => send(res, 400, { error: "bad data" }));
    return;
  }

  send(res, 405, { error: "method not allowed" });
});

server.listen(PORT, () => {
  console.log("Data server running at http://localhost:" + PORT);
});
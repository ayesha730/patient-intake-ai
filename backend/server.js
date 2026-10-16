// Local data server. Stores patient and doctor data in backend/data.json
// and forwards AI summary requests to Token Factory (through ai.js).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { askModel, parseJson, SUMMARY_PROMPT, isConfigured } = require("./ai");

const PORT = 3001;
const DATA_FILE = path.join(__dirname, "data.json");
const EMPTY = { records: [], alerts: [], doctors: [], doctorProfile: null, audit: [] };
const MAX_AUDIT = 500;

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
      if (body.length > 5000000) {
        req.destroy();
        reject(new Error("too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// Asks the AI for a summary. The app shows the result only after the doctor clicks a button.
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

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  if (req.url === "/api/ai/summary") {
    if (req.method !== "POST") return send(res, 405, { error: "method not allowed" });
    return handleSummary(req, res).catch(() => send(res, 500, { error: "server error" }));
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
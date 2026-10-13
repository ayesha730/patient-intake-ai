// Local data server. Stores patient and doctor data in backend/data.json
// so every browser on this computer (and, on the same network, others) sees the same data.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const DATA_FILE = path.join(__dirname, "data.json");
const EMPTY = { records: [], alerts: [], doctors: [], doctorProfile: null };

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
  fs.renameSync(tmp, DATA_FILE); // write to a temp file first, so a crash cannot corrupt data
}

function send(res, code, body) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (code === 204) return res.end();
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.url !== "/api/state") return send(res, 404, { error: "not found" });

  if (req.method === "GET") return send(res, 200, readState());

  if (req.method === "PUT") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) req.destroy(); // refuse huge requests
    });
    req.on("end", () => {
      try {
        const incoming = JSON.parse(body);
        writeState({
          records: Array.isArray(incoming.records) ? incoming.records : [],
          alerts: Array.isArray(incoming.alerts) ? incoming.alerts : [],
          doctors: Array.isArray(incoming.doctors) ? incoming.doctors : [],
          doctorProfile: incoming.doctorProfile || null,
        });
        send(res, 200, { ok: true });
      } catch {
        send(res, 400, { error: "bad data" });
      }
    });
    return;
  }

  send(res, 405, { error: "method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Data server running at http://localhost:${PORT}`);
});
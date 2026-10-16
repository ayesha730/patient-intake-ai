// Talks to the AMD Token Factory model. Runs only on the server, so the key stays secret.
// Settings come from backend/.env.
// The team shares one key, so calls run one at a time, with a short gap and retries on "too many requests".
const KEY = process.env.TOKEN_FACTORY_KEY;
const URL_ = process.env.TOKEN_FACTORY_URL;
const MODEL = process.env.TOKEN_FACTORY_MODEL;
const MAX_TRIES = 3;

function isConfigured() {
  return Boolean(
    KEY && URL_ && MODEL &&
    !KEY.startsWith("paste") && !URL_.startsWith("paste") && !MODEL.startsWith("paste")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// One request to the model. Retries on "too many requests", server errors, and timeouts.
async function askOnce(systemPrompt, userText) {
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let retry = false;
    try {
      const res = await fetch(URL_, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText },
          ],
        }),
        signal: controller.signal,
      });
      if (res.status === 429 || res.status >= 500) {
        retry = true;
      } else if (!res.ok) {
        return null;
      } else {
        const data = await res.json();
        const choice = data.choices && data.choices[0];
        return (choice && choice.message && choice.message.content) || null;
      }
    } catch {
      retry = true;
    } finally {
      clearTimeout(timer);
    }
    if (retry && attempt < MAX_TRIES) await sleep(2000 * attempt);
  }
  return null;
}

// Calls go into one line, so only one is sent at a time
let queue = Promise.resolve();

function askModel(systemPrompt, userText) {
  if (!isConfigured()) return Promise.resolve(null);
  const job = queue.then(async () => {
    const answer = await askOnce(systemPrompt, userText);
    await sleep(1500); // short gap between calls, so the shared key is not flooded
    return answer;
  });
  queue = job.catch(() => null);
  return job;
}

// Finds the JSON part of the model's answer. Returns null if it cannot be read.
function parseJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

const SUMMARY_PROMPT = [
  "You help a doctor read a patient's words before a visit.",
  "Use only what the patient said. Do not diagnose and do not name any illness.",
  "If the words describe a possible emergency (for example chest pain, trouble breathing, fainting, heavy bleeding, stroke signs), set red_flag to true.",
  "Set confidence to low if the words are very short or unclear, medium if some details are missing, and high if the words are clear.",
  'Reply with JSON only, in this form: {"summary": "one or two sentences", "confidence": "high", "red_flag": false}',
].join(" ");

module.exports = { askModel, parseJson, SUMMARY_PROMPT, isConfigured };
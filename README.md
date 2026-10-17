# Patient Intake AI

An AI-assisted patient intake system. Patients describe their symptoms in a chat, the AI asks follow-up questions, and the doctor receives a structured summary with AI suggestions that the doctor must approve or reject. The AI never diagnoses or prescribes, and it never tells a patient which medicine to take.

## What it does

**Patient app**
- Home screen with a **Message doctor** button.
- Consent screen with a language choice and a consent checkbox before any data is entered.
- AI symptom chat. The AI asks one question at a time and suggests the type of doctor to see.
- Emergency screen. If the patient describes a red-flag symptom, they are told to get help now and the intake stops.
- Booking screen with a token number and queue position.
- Messages screen. Shows **Advice from your doctor** (approved and rejected items, each with a status label) and **Your reports**. After treatment is finished, the patient can rate their visit.

**Doctor app**
- Patient list with token, arrival time and urgency.
- Patient detail with **What the patient said** and an AI summary that shows a confidence badge.
- **AI suggestions: approve or reject.** Each suggestion is pending until the doctor acts. A rejection needs a reason.
- **Medicine check.** Compares medicines the patient mentions with the doctor's list and flags AI-only items.
- **Reading and intake** card with word counts and intake time.
- **AI accuracy from doctor decisions** panel, calculated from the doctor's approvals and rejections.
- **Treatment and review** card with the patient's star rating.

## Safety rules

- The AI must not give a diagnosis or name medicines in its replies. This is enforced in the system prompt (`CHAT_PROMPT` in `backend/server.js`).
- AI suggestions are returned only when the intake conversation is finished. During the chat, the suggestion list stays empty (`handleChat` in `backend/server.js`).
- Every suggestion starts as `pending`. Nothing reaches the patient until a doctor approves it.
- Emergencies are checked before any normal reply. The emergency screen is shown instead.
- Patient data is stored only with consent. Test data in this repository is fake.
- Incorrect or uncertain AI output is visible: low-confidence summaries are labelled, and doctors can reject any suggestion with a reason.
- High-risk decisions and final treatment always stay with the doctor.

## AMD technology

TODO: Describe which part of the workload runs on AMD (for example, AMD Developer Cloud with ROCm serving the language model), and how the judges can verify it.

## Evaluation

The emergency detector and suggestion quality are tested with a script in `backend/`. The results are saved to `backend/eval-results.md`.

Latest run summary:

- Missed emergencies: 0
- False alarms: 0

See `backend/eval-results.md` for the full results table.

## Project structure

```
patient-intake-ai/
├── backend/
│   ├── server.js          # API, AI chat, suggestions, status endpoint
│   ├── data.json          # Local data store (fake data only)
│   ├── eval-results.md    # Evaluation output
│   └── .env.example       # Environment variable names (no real keys)
└── frontend/
    └── src/
        ├── App.jsx        # Patient and doctor screens, intake flow
        └── components/
            ├── SuggestionReview.jsx   # Approve / reject AI suggestions
            ├── AccuracyPanel.jsx      # AI accuracy from doctor decisions
            └── AiStatus.jsx           # Status bar showing AI connection
```

## Setup

### Requirements

- Node.js (version TODO)
- An API key for the language model provider

### Backend

```bash
cd backend
npm install
# create backend/.env from .env.example and add your own key
node server.js
```

When the server starts you should see:

```
Data server running at http://localhost:3001
```

Check the AI connection at `http://localhost:3001/api/ai/status`. It should return `"configured": true` and the model name.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run the evaluation

```bash
cd backend
node eval.js   # script name TODO
```


## Security

- Never commit `.env` or any file that contains an API key.
- Use fake patient data for demos and screenshots.
- Keep `.env` in `.gitignore`.

## Team

TODO

# TrueComplaint AI

Voice-powered clinical intake demo — patients describe symptoms via AI conversation; physicians review structured clinical briefs on a triage dashboard.

## Stack

- **Server:** Node.js + Express, OpenAI SDK (Realtime WebRTC, Chat Completions, Whisper, TTS)
- **Client:** React + Vite, React Router, Zustand, Tailwind CSS

## Setup

### 1. Server

```bash
cd server
cp .env.example .env
# Add your OpenAI API key to .env
npm install
npm run dev
```

Server runs on **http://localhost:5000**

### 2. Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Client runs on **http://localhost:5173**

## Environment Variables

### server/.env

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key (never exposed to client) |
| `USE_REALTIME` | No | `true` (default) for WebRTC Realtime; `false` for Whisper+GPT+TTS fallback |
| `PORT` | No | Server port (default: 5000) |

### client/.env

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend URL (default: `http://localhost:5000`) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/realtime-session` | Mint ephemeral token for WebRTC voice |
| POST | `/api/extract` | Transcript → structured clinical brief |
| GET | `/api/voice-mode` | Returns `{ useRealtime: boolean }` |
| POST | `/api/transcribe` | Fallback STT (multipart audio) |
| POST | `/api/speak` | Fallback TTS |
| POST | `/api/fallback-turn` | Fallback conversation turn |
| GET | `/api/cases` | List cases (urgent-first) |
| GET | `/api/cases/:id` | Get single case |
| POST | `/api/cases` | Create case after intake |
| PATCH | `/api/cases/:id` | Update case status |

## User Flows

### Patient
1. Select "I'm a Patient" on login
2. Tap mic → voice conversation with TrueComplaint AI
3. End conversation → transcript extracted → clinical brief saved
4. View report with urgency level and recommended action

### Doctor
1. Select "I'm a Doctor" on login
2. Dashboard shows seeded + new cases sorted by urgency
3. Open case → review structured brief, transcript, mark as reviewed

## QA Checklist

- [ ] Both servers start without errors
- [ ] Missing `OPENAI_API_KEY` crashes server with clear message
- [ ] Mic permission denied shows error (no hang)
- [ ] Double-click mic doesn't open two sessions
- [ ] End conversation → mic indicator turns off
- [ ] Red-flag transcript → `urgency_level: "emergency"`
- [ ] Short transcript doesn't crash extract
- [ ] Doctor dashboard shows seeded cases urgent-first
- [ ] Server down → ErrorBanner on client pages

## Security Notes

- OpenAI API key lives **only** in `server/.env`
- Client uses ephemeral tokens for Realtime WebRTC
- No `VITE_*` env vars contain secrets

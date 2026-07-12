# Deploy frontend to Vercel (UI demo — no OpenAI)

The Vercel deployment is a **static UI demo** with hardcoded sample cases.  
**Live Rakshak voice + OpenAI** stays on your machine via localhost.

## Vercel setup

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repo
4. Set **Root Directory** to `client`
5. Framework: **Vite** (auto-detected)
6. Build settings (auto from `client/vercel.json`):
   - Build: `npm run build`
   - Output: `dist`
7. **Environment variables** — none required (`.env.production` sets `VITE_DEMO_MODE=true`)
8. Deploy

## What works on Vercel

- Landing page
- **EMR System** (5 hardcoded patients + local AI replies)
- **Doctor Dashboard** (sample ophthalmology cases)
- **Patient intake** → **Play Demo Intake** (animated sample conversation)

## What needs localhost

```bash
# Terminal 1 — backend (OpenAI)
cd server
cp .env.example .env   # add OPENAI_API_KEY
npm install && npm run dev

# Terminal 2 — frontend (full mode)
cd client
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:5000
npm install && npm run dev
```

Open http://localhost:5173 for live Rakshak voice, camera, and real extraction.

## Local vs Vercel

| | Vercel | Localhost |
|---|---|---|
| OpenAI / voice | No | Yes |
| EMR charts | Hardcoded | Hardcoded |
| Doctor cases | Demo data | Live + demo |
| Patient call | Play Demo Intake | Live mic + Rakshak |

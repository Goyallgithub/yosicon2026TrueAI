# TrueComplaint AI — Frontend Demo

Ophthalmology intake UI demo for **Vercel** (no backend, no OpenAI, no voice).

## Deploy on Vercel

1. Push this repo to [GitHub](https://github.com/Goyallgithub/yosicon2026TrueAI)
2. [vercel.com](https://vercel.com) → **Import Project**
3. **Root Directory:** leave as `.` (repo root) — `vercel.json` builds `client/`
4. Deploy — no environment variables needed

Or set **Root Directory** to `client` and use default Vite settings.

## Local preview

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## What's included

- Patient intake demo (animated chat)
- Doctor ophthalmology dashboard
- EMR with 5 patients + text AI assistant
- Patient Dawai Report (structured medicine guide)

## Stack

React · Vite · Tailwind · Zustand · React Router

# CareerForge AI — Deployment Details

> No secrets in this file. API keys live only in `.env.local` (local, gitignored)
> and in Vercel Project Settings → Environment Variables (production).

## URLs
- Production: https://careerforge-ai-delta.vercel.app
- GitHub repo: https://github.com/abhiverma123cmd/reverse-engineered-roadmapper
- Local (when running): http://localhost:3100

## Production (Vercel)
- Project: `careerforge-ai` (linked via `.vercel/project.json`, gitignored)
- Deploy command: `vercel --prod` (CLI-driven; GitHub auto-deploy not connected)
- Env vars (Production): `GEMINI_API_KEY` (Secret/Hidden)
- AI default model: `gemini-3.8-flash` with automatic failover to
  `gemini-flash-latest` → `gemini-3.1-flash-lite-preview` → `gemini-3-flash-preview`
  (override with `AI_MODEL`). Failover also covers OpenAI-compatible via `AI_API_KEY`.

## Local
```powershell
$env:PATH = "C:\Program Files\nodejs;$env:APPDATA\npm;" + $env:PATH
npm run dev      # dev server with .env.local
# or
npm run build; npm start -- -p 3100
```

## 3-minute demo path
1. Open `/` → **Try Example**
2. Dream job prefilled: "Red Team Engineer at a cybersecurity company", 10 hrs/week, 6 months → **Generate Roadmap**
3. Skill tree → click **Active Directory** (or any node) → **Ask AI about this milestone**
4. **Mark complete / known** → downstream unlocks, progress recalculates
5. Switch to **Timeline** tab; check **Next best step** + target role

## Verification log
- `tsc --noEmit`: clean | `next lint`: clean | `vitest`: 7/7 pass
- `next build`: succeeds | prod smoke: `/`, `/roadmap`, `/roadmap/view` → 200
- Prod AI: generate → `source: ai` (gemini), node-advice → 200

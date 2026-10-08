# CareerForge AI

## Problem Statement
Problem Statement 1 — Reverse-Engineered Career Roadmapper: allow a student to enter a hyper-specific dream job and generate an AI-powered, personalized, interactive career roadmap.

## What It Does
CareerForge AI turns a hyper-specific dream job into an interactive, dependency-aware career roadmap. It generates skills, projects, certifications, and interview prep sized to your weekly hours and timeline, then visualizes them as an explorable skill tree with progress tracking.

## Key Features
- AI-generated career roadmap from dream job + experience + hours + timeline
- Interactive career graph (React Flow): zoom, pan, clickable milestones, dependency edges
- AI-generated node guidance per milestone (what to learn, practice, project, mistakes, interview questions, next step)
- Progress tracking: percentage, hours remaining, current phase, next-best-step card
- Dynamic roadmap adjustment: marking skills known/completed unlocks downstream nodes; AI replanning endpoint
- Timeline view derived from AI data (phases + weekly plan)
- Example mode with prefilled Red Team Engineer input; clearly-labeled development fallback when no API key is set

## How It Works
User input (validated form) → AI generation (strict Zod JSON schema, never prose parsing) → structured roadmap → interactive visualization (skill tree) → node interaction (details + per-node AI advice) → progress and dynamic updates (local unlock + AI replan) → persistence in localStorage.

## Architecture and Why
- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS. One deployable app for landing, form, and interactive views.
- **Backend/API:** Next.js API routes (`/api/roadmap/generate`, `/api/roadmap/replan`, `/api/node-advice`). Keys stay server-side; inputs and AI outputs are Zod-validated; basic in-memory rate limiting on generation.
- **AI provider:** abstraction in `lib/ai/provider.ts` — auto-selects Gemini (`GEMINI_API_KEY`, default model `gemini-3.8-flash` with automatic failover across `gemini-flash-latest` / `gemini-3.1-flash-lite-preview` / `gemini-3-flash-preview`) or any OpenAI-compatible endpoint (`AI_API_KEY` + optional `AI_BASE_URL`/`AI_MODEL`).
- **Visualization:** React Flow (`@xyflow/react`) for zoom/pan/selection, minimap, and dependency edges — chosen over static lists to show skill prerequisites.
- **Validation:** Zod schemas for form input, roadmap JSON, and node advice.
- **Storage:** localStorage behind `lib/storage/roadmap-storage.ts`, so a database can replace it without touching UI code.
- **Deployment:** standard Next.js build (`next build` / `next start`) or Vercel; no key is ever bundled to the browser.

## What We Added
- Time-constrained planning: estimated hours sized to weekly hours × timeline months.
- Dynamic replanning: completed/known skills unlock downstream nodes locally and can trigger AI replanning.
- Node-level AI advice with six concrete sections.
- Timeline view rendered directly from the AI response.
- Gemini model failover for capacity/retired-model resilience.

## How to Run Locally
```bash
git clone <repository-url>
cd careerforge-ai
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000. To enable AI generation, put one key in `.env.local` (see Environment Variables). Without a key the app uses a clearly-labeled development fallback dataset — never presented as AI output.

Available scripts: `dev`, `build`, `start`, `lint` (`next lint`), `typecheck` (`tsc --noEmit`), `test` (`vitest run`).

## Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key_here
```
Optional: `GOOGLE_API_KEY` (alias), `AI_MODEL` (pin model, default `gemini-3.8-flash`), `AI_API_KEY` + `AI_BASE_URL` + `AI_MODEL` for OpenAI-compatible endpoints, `OPENAI_API_KEY`. Never commit real keys — `.env.local` is gitignored.

## Tools and AI Used
- Next.js, React, TypeScript, Tailwind CSS, React Flow (@xyflow/react), Zod, Lucide React, Vitest, ESLint.
- AI models: Gemini (`gemini-3.8-flash` with failover) via server-side provider abstraction.
- AI is used at runtime for: (1) full roadmap generation from dream-job input, (2) per-milestone actionable guidance, (3) roadmap replanning after progress. AI coding tools assisted scaffolding during the hackathon.

## Who It Is For
Students preparing for jobs/internships and people targeting specific career roles who want a concrete, ordered plan instead of generic advice.

## Deployment
```bash
npm run build
npm start
```
Or deploy to Vercel (or any Next.js host): import the repo, set `GEMINI_API_KEY` (or `AI_API_KEY`) in the host's environment variables, deploy.

## Security
Secrets live only in environment variables (`.env.local`, never committed; `.gitignore` excludes `.env`, `.env.local`, `.env*.local`). API routes validate all inputs and AI outputs, return user-friendly errors without stack traces or keys, and `dangerouslySetInnerHTML` is never used.

## Done / Left / Plan
**Done:** everything in Key Features above, verified with typecheck + lint + 7 unit tests + production build + live AI generation test.
**Left:** user accounts/cloud sync (localStorage only); per-user server rate limits (in-memory per instance); node-advice caching.
**Plan:** database adapter behind the storage module; advice cache; e2e check of the 3-minute demo path.

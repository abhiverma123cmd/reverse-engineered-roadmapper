import Link from "next/link";
import { ArrowRight, Sparkles, Map, GitBranch, Target, FlaskConical } from "lucide-react";

const EXAMPLES = [
  "Red Team Engineer at a cybersecurity company",
  "Full Stack Developer at a climate-tech startup",
  "UI/UX Designer for fintech applications",
  "Data Scientist at a healthcare startup",
];

const STEPS = [
  { icon: Target, title: "Tell AI your dream job", text: "Hyper-specific role, your level, skills, hours and timeline." },
  { icon: Map, title: "Get a dependency-aware roadmap", text: "Phases, skills, projects, certs and interview prep — in order." },
  { icon: GitBranch, title: "Explore the skill tree", text: "Zoom, pan, click any milestone for AI-generated action steps." },
  { icon: Sparkles, title: "Track & adapt", text: "Mark skills known, unlock downstream nodes, replan with AI." },
];

export default function LandingHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-forge-600 font-bold">CF</span>
          <span className="text-lg font-semibold tracking-tight">CareerForge AI</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-white/70 sm:inline">
            AI-generated career guidance
          </span>
          <Link href="/roadmap" className="rounded-lg bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-200">
            Open app
          </Link>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 pb-20 pt-10 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80">
          <FlaskConical size={14} aria-hidden /> Problem Statement 1: Reverse-Engineered Career Roadmapper
        </p>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-forge-300">Reverse-engineer your dream career</p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Turn Your Dream Job Into a Career Roadmap
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Tell AI exactly where you want to go. Get the skills, projects, milestones and timeline needed to get there.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/roadmap"
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-forge-500 px-6 py-3 font-semibold text-white hover:bg-forge-400"
          >
            Build My Roadmap <ArrowRight size={18} aria-hidden />
          </Link>
          <Link
            href="/roadmap?example=1"
            className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            <Sparkles size={18} aria-hidden /> Try Example
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/50">AI-generated career guidance — review suggestions critically.</p>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur" aria-hidden>
          <svg viewBox="0 0 600 190" className="h-auto w-full" role="img" aria-label="Preview of an AI career skill tree">
            <line x1="300" y1="38" x2="150" y2="95" stroke="#617ff6" strokeWidth="2" className="edge-flow" />
            <line x1="300" y1="38" x2="450" y2="95" stroke="#617ff6" strokeWidth="2" className="edge-flow" />
            <line x1="150" y1="125" x2="300" y2="168" stroke="#34d399" strokeWidth="2" className="edge-flow" />
            <line x1="450" y1="125" x2="300" y2="168" stroke="#34d399" strokeWidth="2" className="edge-flow" />
            <rect x="210" y="8" width="180" height="30" rx="15" fill="#3f57ef" />
            <text x="300" y="28" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">Dream Job</text>
            <rect x="70" y="95" width="160" height="30" rx="15" fill="#1e293b" stroke="#617ff6" />
            <text x="150" y="115" textAnchor="middle" fill="#cbd5e1" fontSize="12">Foundations ✓</text>
            <rect x="370" y="95" width="160" height="30" rx="15" fill="#1e293b" stroke="#617ff6" />
            <text x="450" y="115" textAnchor="middle" fill="#cbd5e1" fontSize="12">Core Skills →</text>
            <rect x="205" y="152" width="190" height="30" rx="15" fill="#059669" />
            <text x="300" y="172" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Target Role</text>
          </svg>
        </div>

        <section aria-label="How it works" className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <s.icon size={22} aria-hidden className="text-forge-300" />
              <h2 className="mt-3 font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm text-white/65">{s.text}</p>
            </div>
          ))}
        </section>

        <section aria-label="Example dream jobs" className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Try a dream job</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <li key={e}>
                <Link
                  href={`/roadmap?example=1&job=${encodeURIComponent(e)}`}
                  className="focus-ring inline-block rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  {e}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-slate-950/60 p-4 font-mono text-xs text-white/60" aria-hidden>
            Dream Job → AI phases → Skill tree → Milestone guidance → Progress → Target role
          </div>
        </section>
      </main>
    </div>
  );
}

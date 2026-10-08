"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPinned, Clock, CalendarDays, GraduationCap } from "lucide-react";
import type { Roadmap, RoadmapInput } from "@/types/roadmap";
import { loadRoadmap, clearRoadmap, loadInput } from "@/lib/storage/roadmap-storage";
import { computeProgress } from "@/lib/roadmap/scoring";

const RoadmapCanvas = dynamic(() => import("@/components/roadmap/RoadmapCanvas"), {
  ssr: false,
  loading: () => <p className="rounded-2xl border bg-white p-6 text-sm">Loading interactive skill tree…</p>,
});

export default function RoadmapViewPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [input, setInput] = useState<RoadmapInput | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoadmap(loadRoadmap());
    setInput(loadInput<RoadmapInput>());
    setReady(true);
  }, []);

  if (!ready) return <main className="mx-auto max-w-6xl px-6 py-10"><p>Loading roadmap…</p></main>;

  if (!roadmap) {
    return (
      <main id="main" className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Your roadmap couldn&apos;t be loaded.</h1>
        <p className="mt-2 text-slate-600">Generate one from your dream job first — it only takes a minute.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/roadmap" className="focus-ring rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">Build My Roadmap</Link>
          <Link href="/roadmap?example=1" className="focus-ring rounded-xl border px-5 py-2.5 font-semibold">Try Example</Link>
        </div>
      </main>
    );
  }

  const p = computeProgress(roadmap);
  const level = input?.experience ? input.experience[0].toUpperCase() + input.experience.slice(1) : "—";
  const target = input?.timeline ?? roadmap.careerGoal.estimatedTimeline;
  const hours = input ? `${input.weeklyHours} hrs/week` : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <header className="border-b bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href="/" className="focus-ring text-sm text-white/60 hover:text-white">← CareerForge AI</Link>
            <div className="flex gap-2">
              <Link href="/roadmap" className="focus-ring rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/10">New roadmap</Link>
              <button
                onClick={() => { clearRoadmap(); setRoadmap(null); }}
                className="focus-ring rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-white/10"
              >
                Clear saved
              </button>
            </div>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-forge-300">Career Roadmap · ✦ AI-generated</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{roadmap.careerGoal.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><GraduationCap size={14} aria-hidden /> Current Level: {level}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><CalendarDays size={14} aria-hidden /> Target: {target}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><Clock size={14} aria-hidden /> Study Time: {hours}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><MapPinned size={14} aria-hidden /> Current Phase: {p.currentPhaseTitle}</span>
          </div>
          <div className="mt-4 rounded-2xl bg-white/5 p-4 backdrop-blur">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Career Progress</p>
              <p className="text-2xl font-bold" aria-live="polite">{p.pct}% <span className="text-sm font-medium text-white/60">{p.completed} / {p.total} milestones</span></p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Career progress">
              <div className="h-full rounded-full bg-gradient-to-r from-forge-400 via-forge-500 to-violet-500 transition-all" style={{ width: `${p.pct}%` }} />
            </div>
            {p.nextBest && (
              <p className="mt-2 text-sm text-white/80">
                Next Recommended: <span className="font-bold text-white">{p.nextBest.title}</span>
              </p>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <RoadmapCanvas key={roadmap.generatedAt} initialRoadmap={roadmap} />
        {roadmap.successMetrics.length > 0 && (
          <section aria-label="Success metrics" className="mt-4 rounded-2xl border bg-white p-5">
            <h2 className="font-bold">How you&apos;ll know you&apos;re ready</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {roadmap.successMetrics.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

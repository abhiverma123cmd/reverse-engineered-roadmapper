"use client";

import { useMemo } from "react";
import type { Roadmap } from "@/types/roadmap";
import { computeProgress } from "@/lib/roadmap/scoring";

export default function ProgressPanel({ roadmap }: { roadmap: Roadmap }) {
  const p = useMemo(() => computeProgress(roadmap), [roadmap]);
  return (
    <section aria-label="Career progress" className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Career Progress</h2>
      <p className="mt-2 text-3xl font-bold" aria-live="polite">{p.pct}%</p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Career progress">
        <div className="h-full rounded-full bg-forge-600 transition-all" style={{ width: `${p.pct}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Completed</dt><dd>{p.completed} / {p.total} milestones</dd></div>
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Hours left</dt><dd>~{p.hoursRemaining}h of {p.hoursTotal}h</dd></div>
        <div className="col-span-2 rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Current phase</dt><dd>{p.currentPhaseTitle}</dd></div>
      </dl>
      {p.nextBest && (
        <div className="mt-3 rounded-xl border border-forge-200 bg-forge-50 p-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-forge-700">Next best step</h3>
          <p className="mt-1 text-sm font-semibold">{p.nextBest.title}</p>
          <p className="text-xs text-slate-600">Estimated: {p.nextBest.estimatedHours} hours</p>
          <p className="mt-1 text-xs text-slate-600">Why: {p.nextReason}</p>
        </div>
      )}
      {roadmap.intermediateRoles.length > 0 && (
        <div className="mt-3 text-xs">
          <h3 className="font-bold">Intermediate roles</h3>
          <p className="text-slate-600">{roadmap.intermediateRoles.join(" → ")}</p>
          <p className="mt-1 font-semibold">Target: {roadmap.finalRole}</p>
        </div>
      )}
    </section>
  );
}

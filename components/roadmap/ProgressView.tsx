"use client";

import { useMemo } from "react";
import { Clock, Flag, Target, TrendingUp } from "lucide-react";
import type { Roadmap } from "@/types/roadmap";
import { computeProgress, allNodes } from "@/lib/roadmap/scoring";

const TYPE_LABELS: Record<string, string> = {
  skill: "Skills",
  project: "Projects",
  certification: "Certifications",
  milestone: "Milestones",
  interview: "Interview prep",
};

export default function ProgressView({ roadmap, onFocus }: { roadmap: Roadmap; onFocus: (id: string) => void }) {
  const p = useMemo(() => computeProgress(roadmap), [roadmap]);
  const nodes = useMemo(() => allNodes(roadmap), [roadmap]);

  const byType = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const n of nodes) {
      map[n.type] ??= { total: 0, done: 0 };
      map[n.type].total += 1;
      if (n.status === "completed") map[n.type].done += 1;
    }
    return map;
  }, [nodes]);

  const hoursDone = p.hoursTotal - p.hoursRemaining;

  return (
    <div className="space-y-4 p-4 sm:p-6" aria-label="Progress dashboard">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <TrendingUp size={14} aria-hidden /> Overall
          </p>
          <p className="mt-1 text-3xl font-bold">{p.pct}%</p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
            <div className="h-full rounded-full bg-forge-600 transition-all" style={{ width: `${p.pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{p.completed} of {p.total} milestones</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <Clock size={14} aria-hidden /> Hours
          </p>
          <p className="mt-1 text-3xl font-bold">{hoursDone}<span className="text-base text-slate-400">/{p.hoursTotal}h</span></p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={p.hoursTotal ? Math.round((hoursDone / p.hoursTotal) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="Hours completed">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${p.hoursTotal ? (hoursDone / p.hoursTotal) * 100 : 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">~{p.hoursRemaining}h remaining</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            <Flag size={14} aria-hidden /> Position
          </p>
          <p className="mt-1 font-bold leading-snug">{p.currentPhaseTitle}</p>
          <p className="mt-1 text-xs text-slate-500">Target: {roadmap.careerGoal.estimatedTimeline}</p>
          <p className="mt-1 text-xs font-semibold text-forge-700">Final: {roadmap.finalRole}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="font-bold">Phase progress</h3>
        <ul className="mt-3 space-y-3">
          {roadmap.phases.map((phase, i) => {
            const total = phase.nodes.length;
            const done = phase.nodes.filter((n) => n.status === "completed").length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={phase.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span><span className="font-mono text-xs font-bold text-forge-600">{String(i + 1).padStart(2, "0")}</span> <span className="font-semibold">{phase.title}</span></span>
                  <span className="text-xs text-slate-500">{done}/{total} · {pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${phase.title} progress`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-forge-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-bold">By type</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {Object.entries(byType).map(([t, v]) => (
              <li key={t} className="flex items-center justify-between">
                <span className="text-slate-600">{TYPE_LABELS[t] ?? t}</span>
                <span className="font-semibold">{v.done}/{v.total}</span>
              </li>
            ))}
          </ul>
        </div>
        {p.nextBest && (
          <div className="rounded-2xl border border-forge-200 bg-forge-50 p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-forge-700">
              <Target size={14} aria-hidden /> Next milestone
            </p>
            <p className="mt-1 font-bold">{p.nextBest.title}</p>
            <p className="text-xs text-slate-600">{p.nextBest.estimatedHours}h · {p.nextReason}</p>
            <button
              onClick={() => onFocus(p.nextBest!.id)}
              className="focus-ring mt-2 rounded-xl bg-forge-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forge-500"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

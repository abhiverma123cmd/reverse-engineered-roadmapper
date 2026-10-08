import { CheckCircle2, Lock, PlayCircle, CircleDashed } from "lucide-react";
import type { Roadmap } from "@/types/roadmap";

const GLYPH: Record<string, { icon: typeof Lock; text: string }> = {
  locked: { icon: Lock, text: "🔒 Locked" },
  available: { icon: CircleDashed, text: "→ Available" },
  "in-progress": { icon: PlayCircle, text: "◐ In progress" },
  completed: { icon: CheckCircle2, text: "✓ Completed" },
};

export default function TimelineView({
  roadmap,
  onSelect,
  selectedId,
}: {
  roadmap: Roadmap;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <div className="p-4 sm:p-6" aria-label="Roadmap timeline">
      <ol className="relative space-y-6 border-l-2 border-forge-200 pl-6">
        {roadmap.phases.map((phase, i) => {
          const done = phase.nodes.filter((n) => n.status === "completed").length;
          return (
            <li key={phase.id} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[38px] grid h-8 w-8 place-items-center rounded-full border-2 font-mono text-xs font-bold ${
                  done === phase.nodes.length ? "border-emerald-500 bg-emerald-500 text-white" : "border-forge-400 bg-white text-forge-700"
                }`}
              >
                {done === phase.nodes.length ? "✓" : i + 1}
              </span>
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-forge-600">
                  {phase.estimatedDuration} · {done}/{phase.nodes.length} done
                </p>
                <h3 className="mt-0.5 text-lg font-bold">{phase.title}</h3>
                <p className="text-sm text-slate-500">{phase.description}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {phase.nodes.map((n) => {
                    const g = GLYPH[n.status] ?? GLYPH.locked;
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => onSelect(n.id)}
                          aria-pressed={selectedId === n.id}
                          className={`focus-ring flex w-full items-center justify-between gap-2 rounded-xl border bg-slate-50 px-3 py-2.5 text-left text-sm transition hover:border-forge-400 hover:bg-white ${
                            selectedId === n.id ? "border-forge-600 bg-white ring-2 ring-forge-600" : ""
                          }`}
                        >
                          <span>
                            <span className="font-semibold">{n.title}</span>
                            <br />
                            <span className="text-xs text-slate-500">{n.estimatedHours}h · {n.type}</span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
                            <g.icon size={14} aria-hidden /> <span className="hidden sm:inline">{g.text}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
      {roadmap.weeklyPlan.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-bold">Weekly plan (first {Math.min(8, roadmap.weeklyPlan.length)} weeks)</h3>
          <ol className="mt-2 grid gap-2 sm:grid-cols-2">
            {roadmap.weeklyPlan.slice(0, 8).map((w) => (
              <li key={w.week} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="font-bold text-slate-900">Week {w.week}:</span> {w.focus} ({w.hours}h)
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

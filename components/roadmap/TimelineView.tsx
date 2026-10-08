import type { Roadmap } from "@/types/roadmap";

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
    <ol className="space-y-4 p-4" aria-label="Roadmap timeline">
      {roadmap.phases.map((phase) => (
        <li key={phase.id} className="rounded-xl border bg-slate-50 p-4">
          <h3 className="font-bold">{phase.title}</h3>
          <p className="text-xs text-slate-500">{phase.estimatedDuration} — {phase.description}</p>
          <ul className="mt-2 space-y-1.5">
            {phase.nodes.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => onSelect(n.id)}
                  aria-pressed={selectedId === n.id}
                  className={`focus-ring flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm hover:border-forge-400 ${selectedId === n.id ? "border-forge-600 ring-1 ring-forge-600" : ""}`}
                >
                  <span><span className="font-medium">{n.title}</span> <span className="text-xs text-slate-500">· {n.estimatedHours}h · {n.status}</span></span>
                  <span className="text-xs uppercase text-slate-400">{n.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
      {roadmap.weeklyPlan.length > 0 && (
        <li className="rounded-xl border bg-white p-4">
          <h3 className="font-bold">Weekly plan (first {Math.min(8, roadmap.weeklyPlan.length)} weeks)</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {roadmap.weeklyPlan.slice(0, 8).map((w) => (
              <li key={w.week} className="text-slate-600">
                <span className="font-semibold text-slate-900">Week {w.week}:</span> {w.focus} ({w.hours}h)
              </li>
            ))}
          </ul>
        </li>
      )}
    </ol>
  );
}

const ITEMS = [
  { status: "locked", label: "Locked", swatch: "bg-slate-200 border-slate-300" },
  { status: "available", label: "Available", swatch: "bg-white border-forge-400" },
  { status: "in-progress", label: "In progress", swatch: "bg-amber-100 border-amber-400" },
  { status: "completed", label: "Completed", swatch: "bg-emerald-100 border-emerald-500" },
];

export default function RoadmapLegend() {
  return (
    <div className="flex flex-wrap gap-3 border-t bg-white px-4 py-2 text-xs" aria-label="Roadmap legend">
      {ITEMS.map((i) => (
        <span key={i.status} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-full border ${i.swatch}`} aria-hidden />
          {i.label} <span className="sr-only">status</span>
        </span>
      ))}
    </div>
  );
}

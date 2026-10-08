"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  CircleDashed,
  Award,
  FolderKanban,
  Brain,
  Flag,
  Wrench,
  Crown,
  Clock,
  Gauge,
} from "lucide-react";
import type { RoadmapNodeData } from "@/types/roadmap";

type Extra = {
  phaseTitle: string;
  phaseIndex?: number;
  isTarget?: boolean;
  dimmed?: boolean;
  freshUnlock?: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  locked: "border-slate-300 bg-slate-100/90 text-slate-500",
  available: "border-forge-500 bg-white text-slate-900 shadow-md",
  "in-progress": "border-amber-500 bg-gradient-to-br from-amber-50 to-white text-slate-900 shadow-lg",
  completed: "border-emerald-500 bg-gradient-to-br from-emerald-50 to-white text-slate-900 shadow-md",
};

const TYPE_ICON: Record<string, typeof Wrench> = {
  skill: Wrench,
  project: FolderKanban,
  certification: Award,
  milestone: Flag,
  interview: Brain,
};

const STATUS_META: Record<string, { icon: typeof Lock; glyph: string; label: string }> = {
  locked: { icon: Lock, glyph: "🔒", label: "Locked" },
  available: { icon: CircleDashed, glyph: "→", label: "Available" },
  "in-progress": { icon: PlayCircle, glyph: "◐", label: "In progress" },
  completed: { icon: CheckCircle2, glyph: "✓", label: "Completed" },
};

function RoadmapNode({ data, selected }: NodeProps) {
  const d = data as unknown as RoadmapNodeData & Extra;
  const Icon = d.isTarget ? Crown : TYPE_ICON[d.type] ?? Wrench;
  const meta = STATUS_META[d.status] ?? STATUS_META.locked;
  const StatusIcon = meta.icon;

  return (
    <div
      className={`group relative w-60 rounded-2xl border-2 p-3 transition-all duration-150 hover:scale-[1.04] hover:shadow-xl sm:w-64 ${
        STATUS_STYLE[d.status]
      } ${selected ? "ring-2 ring-forge-600 ring-offset-2" : ""} ${
        d.dimmed ? "opacity-30 saturate-50" : ""
      } ${d.freshUnlock ? "animate-pulse ring-2 ring-forge-400" : ""} ${
        d.isTarget ? "border-violet-600 bg-gradient-to-br from-violet-600 to-forge-600 text-white shadow-xl" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${d.title} — ${meta.label}${d.isTarget ? " (target role)" : ""}`}
      title={`${d.title} · ${meta.label} · ${d.difficulty} · ${d.estimatedHours}h — click for details`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            d.isTarget ? "bg-white/20 text-white" : "bg-black/5"
          }`}
        >
          <Icon size={12} aria-hidden /> {d.isTarget ? "Target role" : d.type}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold" aria-hidden={false}>
          <span aria-hidden>{meta.glyph}</span>
          <StatusIcon size={13} aria-hidden /> {meta.label}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-bold leading-snug">{d.title}</h3>
      {!d.isTarget && <p className="mt-1 line-clamp-2 text-xs opacity-80">{d.description}</p>}
      <div className={`mt-2 flex items-center gap-3 text-[11px] font-medium ${d.isTarget ? "opacity-90" : "opacity-70"}`}>
        {!d.isTarget && (
          <>
            <span className="inline-flex items-center gap-1">
              <Gauge size={12} aria-hidden /> {d.difficulty}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden /> {d.estimatedHours}h
            </span>
          </>
        )}
        <span className="truncate">{d.phaseTitle}</span>
      </div>
      {/* Hover tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute -top-2 left-1/2 z-10 w-52 -translate-x-1/2 -translate-y-full rounded-xl border bg-slate-900 p-2 text-[11px] leading-snug text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="font-bold">{d.title}</span> — {meta.label}
        <br />
        {d.difficulty} · {d.estimatedHours}h · Click for full details
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(RoadmapNode);

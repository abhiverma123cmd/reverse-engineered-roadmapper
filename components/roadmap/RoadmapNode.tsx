"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle2, Lock, PlayCircle, CircleDashed, Award, FolderKanban, Brain, Flag, Wrench } from "lucide-react";
import type { RoadmapNodeData } from "@/types/roadmap";

const STATUS_STYLE: Record<string, string> = {
  locked: "border-slate-300 bg-slate-100 text-slate-500",
  available: "border-forge-400 bg-white text-slate-900 shadow-sm",
  "in-progress": "border-amber-400 bg-amber-50 text-slate-900 shadow",
  completed: "border-emerald-500 bg-emerald-50 text-slate-900",
};

const TYPE_ICON: Record<string, typeof Wrench> = {
  skill: Wrench,
  project: FolderKanban,
  certification: Award,
  milestone: Flag,
  interview: Brain,
};

function RoadmapNode({ data, selected }: NodeProps) {
  const d = data as unknown as RoadmapNodeData & { phaseTitle: string };
  const Icon = TYPE_ICON[d.type] ?? Wrench;
  const StatusIcon =
    d.status === "completed" ? CheckCircle2 : d.status === "in-progress" ? PlayCircle : d.status === "locked" ? Lock : CircleDashed;
  return (
    <div
      className={`w-64 rounded-2xl border-2 p-3 transition ${STATUS_STYLE[d.status]} ${selected ? "ring-2 ring-forge-600" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${d.title} — ${d.status}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          <Icon size={12} aria-hidden /> {d.type}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium">
          <StatusIcon size={13} aria-hidden /> {d.status}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-bold leading-snug">{d.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs opacity-80">{d.description}</p>
      <p className="mt-2 text-[11px] font-medium opacity-70">
        {d.difficulty} · {d.estimatedHours}h · {d.phaseTitle}
      </p>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(RoadmapNode);

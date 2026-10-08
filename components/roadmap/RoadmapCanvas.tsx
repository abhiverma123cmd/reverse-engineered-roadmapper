"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Search, RotateCcw, Sparkles, GitBranch, ListOrdered, Gauge } from "lucide-react";
import RoadmapNode from "./RoadmapNode";
import RoadmapControls from "./RoadmapControls";
import NodeDetailsPanel from "./NodeDetailsPanel";
import ProgressPanel from "./ProgressPanel";
import TimelineView from "./TimelineView";
import ProgressView from "./ProgressView";
import RoadmapLegend from "./RoadmapLegend";
import type { Roadmap, RoadmapNodeData, NodeStatus, NodeType } from "@/types/roadmap";
import { roadmapToTree, unlockDownstream } from "@/lib/roadmap/transform";
import { computeProgress, markNode } from "@/lib/roadmap/scoring";
import { saveRoadmap } from "@/lib/storage/roadmap-storage";

const nodeTypes = { roadmapNode: RoadmapNode };

type Mode = "tree" | "timeline" | "progress";

export default function RoadmapCanvas({ initialRoadmap }: { initialRoadmap: Roadmap }) {
  const [roadmap, setRoadmap] = useState<Roadmap>(initialRoadmap);
  const [mode, setMode] = useState<Mode>("tree");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | NodeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | NodeStatus>("all");
  const [freshUnlocks, setFreshUnlocks] = useState<Set<string>>(new Set());
  const [replanMsg, setReplanMsg] = useState("");
  const [replanning, setReplanning] = useState(false);
  const instanceRef = useRef<ReactFlowInstance | null>(null);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = useMemo(() => computeProgress(roadmap), [roadmap]);

  const allFlat = useMemo(
    () =>
      roadmap.phases.flatMap((p, pi) =>
        p.nodes.map((n) => ({ ...n, phaseTitle: p.title, phaseIndex: pi }))
      ),
    [roadmap]
  );

  const matches = useCallback(
    (n: { title: string; description: string; skills: string[]; type: string; phaseTitle: string }) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [n.title, n.description, n.type, n.phaseTitle, ...n.skills]
        .join(" ")
        .toLowerCase()
        .includes(q);
    },
    [search]
  );

  const flowNodes = useMemo(() => {
    const { nodes } = roadmapToTree(roadmap);
    return nodes.map((n) => {
      const d = n.data as RoadmapNodeData & { isTarget?: boolean; phaseTitle: string; phaseIndex?: number };
      const typeOk = typeFilter === "all" || d.type === typeFilter || d.isTarget;
      const statusOk = statusFilter === "all" || d.status === statusFilter || d.isTarget;
      const hit = d.isTarget ? true : matches(d);
      return {
        ...n,
        hidden: !typeOk || !statusOk,
        data: { ...d, dimmed: search.trim().length > 0 && !hit, freshUnlock: freshUnlocks.has(n.id) },
      };
    });
  }, [roadmap, typeFilter, statusFilter, matches, search, freshUnlocks]);

  const flowEdges = useMemo(() => {
    const { edges } = roadmapToTree(roadmap);
    const byId = new Map(allFlat.map((n) => [n.id, n]));
    return edges.map((e) => {
      const target = byId.get(e.target);
      const source = byId.get(e.source);
      const unlocked = freshUnlocks.has(e.target);
      const done = source?.status === "completed" || e.source === "__target";
      const active = target && (target.status === "available" || target.status === "in-progress");
      return {
        ...e,
        animated: unlocked || (active && done) || e.target === "__target",
        style: {
          strokeWidth: unlocked ? 3 : 2,
          stroke: target?.status === "completed" || done ? "#10b981" : unlocked ? "#3f57ef" : "#94a3b8",
        },
      };
    });
  }, [roadmap, allFlat, freshUnlocks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges as unknown as Edge[]);

  useEffect(() => {
    setNodes(flowNodes as unknown as Node[]);
    setEdges(flowEdges as unknown as Edge[]);
    saveRoadmap(roadmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowNodes, flowEdges, roadmap]);

  useEffect(() => () => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
  }, []);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === "__target") {
      const t = roadmapToTree(roadmap).nodes.find((n) => n.id === "__target");
      return t ? { ...(t.data as RoadmapNodeData & { phaseTitle: string }) } : null;
    }
    return allFlat.find((n) => n.id === selectedId) ?? null;
  }, [roadmap, allFlat, selectedId]);

  const updateStatus = useCallback(
    (id: string, status: RoadmapNodeData["status"]) => {
      if (id === "__target") return;
      const before = new Set(
        allFlat.filter((n) => n.status === "available" || n.status === "in-progress").map((n) => n.id)
      );
      setRoadmap((r) => {
        const next = unlockDownstream(markNode(r, id, status));
        const after = next.phases.flatMap((p) => p.nodes).filter((n) => n.status === "available");
        const newly = after.map((n) => n.id).filter((x) => !before.has(x));
        if (newly.length > 0) {
          setFreshUnlocks(new Set(newly));
          if (unlockTimer.current) clearTimeout(unlockTimer.current);
          unlockTimer.current = setTimeout(() => setFreshUnlocks(new Set()), 4000);
        }
        return next;
      });
    },
    [allFlat]
  );

  const focusNode = useCallback((id: string) => {
    setMode("tree");
    setSelectedId(id);
    requestAnimationFrame(() => {
      instanceRef.current?.fitView({ nodes: [{ id }], padding: 0.35, duration: 400 });
    });
  }, []);

  async function replan() {
    setReplanning(true);
    setReplanMsg("");
    try {
      const completedIds = allFlat.filter((n) => n.status === "completed").map((n) => n.id);
      const res = await fetch("/api/roadmap/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmap, completedIds, knownSkills: [] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Replan failed.");
      setRoadmap(unlockDownstream(data.roadmap));
      setReplanMsg("Roadmap replanned with AI.");
    } catch (e) {
      setReplanMsg(e instanceof Error ? e.message : "Replanning unavailable.");
    } finally {
      setReplanning(false);
    }
  }

  const searchHits = useMemo(
    () => (search.trim() ? allFlat.filter(matches).slice(0, 6) : []),
    [search, allFlat, matches]
  );

  const TABS: Array<{ id: Mode; label: string; icon: typeof GitBranch }> = [
    { id: "tree", label: "Skill Tree", icon: GitBranch },
    { id: "timeline", label: "Timeline", icon: ListOrdered },
    { id: "progress", label: "Progress", icon: Gauge },
  ];

  return (
    <div className="space-y-4">
      {/* Top control bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900 p-1" role="tablist" aria-label="Roadmap views">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                mode === t.id ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white"
              }`}
            >
              <t.icon size={15} aria-hidden /> {t.label}
            </button>
          ))}
        </div>

        <label className="relative min-w-44 flex-1">
          <span className="sr-only">Search skills, projects, certifications</span>
          <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, projects, certifications…"
            className="focus-ring w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm"
          />
        </label>

        <label className="text-xs font-semibold text-slate-500">
          <span className="sr-only">Filter by type</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="focus-ring rounded-xl border bg-white px-2 py-2 text-sm"
          >
            <option value="all">All types</option>
            <option value="skill">Skills</option>
            <option value="project">Projects</option>
            <option value="certification">Certifications</option>
            <option value="milestone">Milestones</option>
            <option value="interview">Interview</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-500">
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="focus-ring rounded-xl border bg-white px-2 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
          </select>
        </label>

        <span className="rounded-full bg-forge-50 px-3 py-1.5 text-xs font-bold text-forge-700" aria-live="polite">
          {progress.pct}% · {progress.completed}/{progress.total}
        </span>
        <button
          onClick={replan}
          disabled={replanning}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <Sparkles size={15} aria-hidden /> {replanning ? "Replanning…" : "Replan"}
        </button>
        <button
          onClick={() => instanceRef.current?.fitView({ padding: 0.2, duration: 300 })}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <RotateCcw size={15} aria-hidden /> Reset view
        </button>
      </div>

      {search.trim() && (
        <div className="rounded-2xl border bg-white p-3 text-sm shadow-sm" role="status">
          {searchHits.length === 0 ? (
            <p className="text-slate-500">
              No matching milestones for “{search}”. <button className="underline" onClick={() => setSearch("")}>Clear search</button>
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {searchHits.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => focusNode(n.id)}
                    className="focus-ring rounded-full border border-forge-200 bg-forge-50 px-3 py-1 text-xs font-semibold text-forge-700 hover:bg-forge-100"
                  >
                    {n.title} · {n.status}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {replanMsg && <p role="status" className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600">{replanMsg}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-50 to-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b bg-white/70 px-4 py-2.5 text-xs">
            {roadmap.source === "fallback" ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                Development fallback data — not AI-generated
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                ✦ AI-generated career guidance
              </span>
            )}
            <span className="text-slate-500">
              {roadmap.phases.length} phases · {progress.total} milestones · ~{progress.hoursRemaining}h remaining
            </span>
          </div>

          {mode === "tree" && (
            <div className="h-[560px] w-full sm:h-[620px]" role="application" aria-label="Interactive career skill tree. Tab to reach milestones, Enter to open details.">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, n) => setSelectedId(n.id)}
                onInit={(i) => (instanceRef.current = i)}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: false }}
              >
                <Background gap={28} />
                <MiniMap pannable zoomable aria-label="Roadmap minimap" />
                <RoadmapControls />
              </ReactFlow>
              <RoadmapLegend />
            </div>
          )}
          {mode === "timeline" && (
            <TimelineView roadmap={roadmap} onSelect={(id) => setSelectedId(id)} selectedId={selectedId} />
          )}
          {mode === "progress" && <ProgressView roadmap={roadmap} onFocus={focusNode} />}
        </div>

        <div className="space-y-4">
          <ProgressPanel
            roadmap={roadmap}
            onContinue={progress.nextBest ? () => focusNode(progress.nextBest!.id) : undefined}
          />
          <NodeDetailsPanel
            node={selected}
            onClose={() => setSelectedId(null)}
            onStatus={updateStatus}
            careerGoal={roadmap.careerGoal.title}
          />
        </div>
      </div>
    </div>
  );
}

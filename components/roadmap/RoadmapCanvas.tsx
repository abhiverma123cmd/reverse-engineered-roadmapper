"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import RoadmapNode from "./RoadmapNode";
import RoadmapControls from "./RoadmapControls";
import NodeDetailsPanel from "./NodeDetailsPanel";
import ProgressPanel from "./ProgressPanel";
import TimelineView from "./TimelineView";
import RoadmapLegend from "./RoadmapLegend";
import type { Roadmap, RoadmapNodeData } from "@/types/roadmap";
import { roadmapToFlow, unlockDownstream } from "@/lib/roadmap/transform";
import { markNode } from "@/lib/roadmap/scoring";
import { saveRoadmap } from "@/lib/storage/roadmap-storage";

const nodeTypes = { roadmapNode: RoadmapNode };

export default function RoadmapCanvas({ initialRoadmap }: { initialRoadmap: Roadmap }) {
  const [roadmap, setRoadmap] = useState<Roadmap>(initialRoadmap);
  const [mode, setMode] = useState<"graph" | "timeline">("graph");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replanMsg, setReplanMsg] = useState<string>("");
  const [replanning, setReplanning] = useState(false);

  const flow = useMemo(() => roadmapToFlow(roadmap), [roadmap]);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.nodes as unknown as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges as unknown as Edge[]);

  useEffect(() => {
    const f = roadmapToFlow(roadmap);
    setNodes(f.nodes as unknown as Node[]);
    setEdges(f.edges as unknown as Edge[]);
    saveRoadmap(roadmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmap]);

  const selected = useMemo(
    () => roadmap.phases.flatMap((p) => p.nodes.map((n) => ({ ...n, phaseTitle: p.title }))).find((n) => n.id === selectedId) ?? null,
    [roadmap, selectedId]
  );

  const updateStatus = useCallback((id: string, status: RoadmapNodeData["status"]) => {
    setRoadmap((r) => unlockDownstream(markNode(r, id, status)));
  }, []);

  async function replan() {
    setReplanning(true);
    setReplanMsg("");
    try {
      const completedIds = roadmap.phases.flatMap((p) => p.nodes).filter((n) => n.status === "completed").map((n) => n.id);
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

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode("graph")} aria-pressed={mode === "graph"}
              className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-medium ${mode === "graph" ? "bg-slate-900 text-white" : "border hover:bg-slate-50"}`}>
              Skill tree
            </button>
            <button onClick={() => setMode("timeline")} aria-pressed={mode === "timeline"}
              className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-medium ${mode === "timeline" ? "bg-slate-900 text-white" : "border hover:bg-slate-50"}`}>
              Timeline
            </button>
            {roadmap.source === "fallback" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Development fallback data — not AI-generated
              </span>
            )}
            {roadmap.source === "ai" && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                AI-generated career guidance
              </span>
            )}
          </div>
          <button onClick={replan} disabled={replanning}
            className="focus-ring rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
            {replanning ? "Replanning…" : "Replan Roadmap with AI"}
          </button>
        </div>
        {replanMsg && <p role="status" className="border-b bg-slate-50 px-4 py-2 text-xs text-slate-600">{replanMsg}</p>}

        {mode === "graph" ? (
          <div className="h-[560px] w-full" role="application" aria-label="Interactive career skill tree. Use plus and minus buttons to zoom; drag to pan; Tab to reach milestones.">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, n) => setSelectedId(n.id)}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: false }}
            >
              <Background />
              <MiniMap pannable zoomable />
              <RoadmapControls />
            </ReactFlow>
            <RoadmapLegend />
          </div>
        ) : (
          <TimelineView roadmap={roadmap} onSelect={setSelectedId} selectedId={selectedId} />
        )}
      </div>

      <div className="space-y-4">
        <ProgressPanel roadmap={roadmap} />
        <NodeDetailsPanel node={selected} onClose={() => setSelectedId(null)} onStatus={updateStatus} careerGoal={roadmap.careerGoal.title} />
      </div>
    </div>
  );
}

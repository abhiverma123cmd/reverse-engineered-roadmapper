import type { Roadmap, RoadmapNodeData } from "@/types/roadmap";

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: RoadmapNodeData & { phaseId: string; phaseTitle: string; phaseIndex?: number; isTarget?: boolean };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

/** Lay out phases left→right, nodes top→bottom within each phase column. */
export function roadmapToFlow(roadmap: Roadmap): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const colX = 360;
  const rowY = 220;
  const seen = new Set<string>();

  roadmap.phases.forEach((phase, pi) => {
    phase.nodes.forEach((node, ni) => {
      if (seen.has(node.id)) return;
      seen.add(node.id);
      nodes.push({
        id: node.id,
        type: "roadmapNode",
        position: { x: pi * colX, y: ni * rowY + (pi % 2) * 60 },
        data: { ...node, phaseId: phase.id, phaseTitle: phase.title },
      });
    });
  });

  // Explicit prerequisite edges
  for (const phase of roadmap.phases) {
    for (const node of phase.nodes) {
      for (const pre of node.prerequisites ?? []) {
        if (seen.has(pre)) edges.push({ id: `${pre}->${node.id}`, source: pre, target: node.id });
      }
    }
  }

  // Sequential backbone edges so the graph is always connected
  const flat = roadmap.phases.flatMap((p) => p.nodes.map((n) => n.id)).filter((id) => seen.has(id));
  for (let i = 1; i < flat.length; i++) {
    const id = `${flat[i - 1]}->${flat[i]}`;
    if (!edges.some((e) => e.id === id)) edges.push({ id, source: flat[i - 1], target: flat[i] });
  }

  return { nodes, edges };
}

/** Vertical career-tree layout: phases as top→bottom lanes, nodes spread per row.
 *  Adds a synthetic TARGET ROLE node fed by the final phase. Pure additive —
 *  roadmapToFlow is untouched. */
export function roadmapToTree(roadmap: Roadmap): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const seen = new Set<string>();
  const colW = 300;
  const rowH = 290;

  roadmap.phases.forEach((phase, pi) => {
    const count = phase.nodes.length;
    phase.nodes.forEach((node, ni) => {
      if (seen.has(node.id)) return;
      seen.add(node.id);
      nodes.push({
        id: node.id,
        type: "roadmapNode",
        position: { x: (ni - (count - 1) / 2) * colW, y: pi * rowH },
        data: { ...node, phaseId: phase.id, phaseTitle: phase.title, phaseIndex: pi },
      });
    });
  });

  for (const phase of roadmap.phases) {
    for (const node of phase.nodes) {
      for (const pre of node.prerequisites ?? []) {
        if (seen.has(pre)) edges.push({ id: `${pre}->${node.id}`, source: pre, target: node.id });
      }
    }
  }

  const flat = roadmap.phases.flatMap((p) => p.nodes.map((n) => n.id)).filter((id) => seen.has(id));
  for (let i = 1; i < flat.length; i++) {
    const id = `${flat[i - 1]}->${flat[i]}`;
    if (!edges.some((e) => e.id === id)) edges.push({ id, source: flat[i - 1], target: flat[i] });
  }

  // Synthetic target-role node below the final lane.
  const lastPhase = roadmap.phases[roadmap.phases.length - 1];
  const lastNodes = (lastPhase?.nodes ?? []).map((n) => n.id).filter((id) => seen.has(id));
  const allDone =
    roadmap.phases.flatMap((p) => p.nodes).filter((n) => n.status !== "completed").length === 0;
  const targetY = roadmap.phases.length * rowH;
  nodes.push({
    id: "__target",
    type: "roadmapNode",
    position: { x: -130, y: targetY },
    data: {
      id: "__target",
      title: roadmap.finalRole || roadmap.careerGoal.title,
      type: "milestone",
      description: roadmap.careerGoal.description || `Target role: ${roadmap.finalRole}`,
      difficulty: "advanced",
      estimatedHours: 0,
      prerequisites: lastNodes,
      skills: [],
      projects: [],
      certifications: [],
      resources: [],
      interviewTopics: [],
      status: allDone ? "completed" : "locked",
      phaseId: "__target",
      phaseTitle: "Target Role",
      phaseIndex: roadmap.phases.length,
      isTarget: true,
    } as FlowNode["data"],
  });
  for (const id of lastNodes) edges.push({ id: `${id}->__target`, source: id, target: "__target" });

  return { nodes, edges };
}

export function unlockDownstream(roadmap: Roadmap): Roadmap {
  const completed = new Set<string>();
  roadmap.phases.forEach((p) => p.nodes.forEach((n) => {
    if (n.status === "completed") completed.add(n.id);
  }));
  return {
    ...roadmap,
    phases: roadmap.phases.map((phase) => ({
      ...phase,
      nodes: phase.nodes.map((node) => {
        if (node.status === "completed") return node;
        const prereqs = node.prerequisites ?? [];
        const ready = prereqs.every((p) => completed.has(p));
        if (ready && node.status === "locked") return { ...node, status: "available" as const };
        if (!ready && node.status === "available" && prereqs.length > 0) return { ...node, status: "locked" as const };
        return node;
      }),
    })),
  };
}

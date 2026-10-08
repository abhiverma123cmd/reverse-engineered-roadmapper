import type { Roadmap, RoadmapNodeData } from "@/types/roadmap";

export interface ProgressSummary {
  total: number;
  completed: number;
  pct: number;
  hoursRemaining: number;
  hoursTotal: number;
  currentPhaseTitle: string;
  nextBest: (RoadmapNodeData & { phaseTitle: string }) | null;
  nextReason: string;
}

export function allNodes(roadmap: Roadmap): Array<RoadmapNodeData & { phaseTitle: string }> {
  return roadmap.phases.flatMap((p) =>
    p.nodes.map((n) => ({ ...n, phaseTitle: p.title }))
  );
}

export function computeProgress(roadmap: Roadmap): ProgressSummary {
  const nodes = allNodes(roadmap);
  const total = nodes.length;
  const completed = nodes.filter((n) => n.status === "completed").length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const hoursTotal = nodes.reduce((s, n) => s + (n.estimatedHours || 0), 0);
  const hoursRemaining = nodes
    .filter((n) => n.status !== "completed")
    .reduce((s, n) => s + (n.estimatedHours || 0), 0);

  let currentPhaseTitle = roadmap.phases[0]?.title ?? "";
  for (const phase of roadmap.phases) {
    if (phase.nodes.some((n) => n.status !== "completed")) {
      currentPhaseTitle = phase.title;
      break;
    }
    currentPhaseTitle = phase.title;
  }

  const completedIds = new Set(nodes.filter((n) => n.status === "completed").map((n) => n.id));
  const candidate =
    nodes.find(
      (n) =>
        (n.status === "available" || n.status === "in-progress") &&
        (n.prerequisites ?? []).every((p) => completedIds.has(p))
    ) ??
    nodes.find((n) => n.status !== "completed") ??
    null;

  let nextReason = "";
  if (candidate) {
    const dependents = nodes.filter((n) => (n.prerequisites ?? []).includes(candidate.id)).length;
    nextReason =
      dependents > 0
        ? `Required before ${dependents} downstream milestone${dependents > 1 ? "s" : ""}.`
        : "The next unfinished milestone in your path.";
  }

  return { total, completed, pct, hoursRemaining, hoursTotal, currentPhaseTitle, nextBest: candidate, nextReason };
}

export function markNode(roadmap: Roadmap, nodeId: string, status: RoadmapNodeData["status"]): Roadmap {
  return {
    ...roadmap,
    phases: roadmap.phases.map((p) => ({
      ...p,
      nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)),
    })),
  };
}

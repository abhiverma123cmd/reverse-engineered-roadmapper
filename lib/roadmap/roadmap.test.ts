import { describe, it, expect } from "vitest";
import { RoadmapInputSchema, RoadmapSchema, NodeAdviceRequestSchema } from "@/lib/ai/schemas";
import { roadmapToFlow, roadmapToTree, unlockDownstream } from "@/lib/roadmap/transform";
import { computeProgress, markNode } from "@/lib/roadmap/scoring";
import { getFallbackRoadmap } from "@/lib/ai/fallback";

describe("input validation", () => {
  it("rejects empty dream job", () => {
    const r = RoadmapInputSchema.safeParse({
      dreamJob: "",
      experience: "beginner",
      existingSkills: [],
      weeklyHours: 10,
      timeline: "6 months",
      timelineMonths: 6,
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid red-team example", () => {
    const r = RoadmapInputSchema.safeParse({
      dreamJob: "Red Team Engineer at a cybersecurity company",
      experience: "beginner",
      existingSkills: ["Basic Python", "Basic Linux"],
      weeklyHours: 10,
      timeline: "6 months",
      timelineMonths: 6,
      learningStyle: "mixed",
    });
    expect(r.success).toBe(true);
  });

  it("rejects malformed node-advice requests", () => {
    const r = NodeAdviceRequestSchema.safeParse({ careerGoal: "x", nodeId: "", nodeTitle: "" });
    expect(r.success).toBe(false);
  });
});

describe("fallback dataset", () => {
  it("validates against the strict roadmap schema", () => {
    const fb = getFallbackRoadmap("Red Team Engineer");
    const r = RoadmapSchema.safeParse(fb);
    expect(r.success).toBe(true);
  });
});

describe("transform + progress", () => {
  const fb = getFallbackRoadmap("Red Team Engineer");

  it("builds a connected flow graph", () => {
    const { nodes, edges } = roadmapToFlow(fb);
    expect(nodes.length).toBeGreaterThan(4);
    expect(edges.length).toBeGreaterThanOrEqual(nodes.length - 1);
  });

  it("computes 0% initially and unlocks downstream after completion", () => {
    expect(computeProgress(fb).pct).toBe(0);
    const done = unlockDownstream(markNode(fb, "linux-basics", "completed"));
    const p = computeProgress(done);
    expect(p.completed).toBe(1);
    expect(p.pct).toBeGreaterThan(0);
    const py = done.phases.flatMap((x) => x.nodes).find((n) => n.id === "python-security");
    expect(py?.status).toBe("available");
  });

  it("builds a vertical career tree with a target-role node", () => {
    const { nodes, edges } = roadmapToTree(fb);
    const target = nodes.find((n) => n.id === "__target");
    expect(target).toBeTruthy();
    expect(target?.data.phaseTitle).toBe("Target Role");
    expect(edges.some((e) => e.target === "__target")).toBe(true);
    // every real node placed below-or-at its phase lane, no duplicates
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("picks a next best step", () => {
    const p = computeProgress(fb);
    expect(p.nextBest).toBeTruthy();
    expect(p.nextReason.length).toBeGreaterThan(0);
  });
});

import { NextResponse } from "next/server";
import { z } from "zod";
import { RoadmapSchema } from "@/lib/ai/schemas";
import { getProvider } from "@/lib/ai/provider";
import type { Roadmap } from "@/types/roadmap";

const ReplanSchema = z.object({
  roadmap: RoadmapSchema,
  completedIds: z.array(z.string().max(120)).max(100).default([]),
  knownSkills: z.array(z.string().max(100)).max(40).default([]),
});

const REPLAN_SYSTEM = `You are a career-roadmap planning engine. Given an existing roadmap plus the learner's completed node ids and newly-known skills, return an UPDATED roadmap in the same JSON schema.
Rules: keep completed nodes with status "completed"; unlock nodes whose prerequisites are met (status "available"); you may shorten hours for known skills but do not delete more than 2 nodes; keep 3-6 phases. Return ONLY valid JSON.`;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const parsed = ReplanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid replan request." }, { status: 400 });
    }
    const provider = getProvider();
    if (!provider.available) {
      return NextResponse.json(
        { error: "AI replanning is unavailable (missing API key). Local progress updates still work." },
        { status: 503 }
      );
    }
    const { roadmap, completedIds, knownSkills } = parsed.data;
    let raw: unknown;
    try {
      raw = await provider.completeJson({
        systemPrompt: REPLAN_SYSTEM,
        userPrompt: `Existing roadmap: ${JSON.stringify(roadmap).slice(0, 12000)}\nCompleted node ids: ${completedIds.join(", ") || "none"}\nNewly-known skills: ${knownSkills.join(", ") || "none"}\nReturn the updated roadmap JSON.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed.";
      return NextResponse.json(
        { error: "AI replanning is temporarily unavailable. Please try again.", detail: msg.slice(0, 200) },
        { status: 502 }
      );
    }
    const validated = RoadmapSchema.safeParse(raw);
    if (!validated.success) {
      return NextResponse.json({ error: "AI returned an unexpected format. Please try again." }, { status: 502 });
    }
    const updated: Roadmap = {
      ...validated.data,
      generatedAt: new Date().toISOString(),
      source: "ai",
    } as Roadmap;
    return NextResponse.json({ roadmap: updated, meta: { provider: provider.name } });
  } catch {
    return NextResponse.json({ error: "AI replanning is temporarily unavailable. Please try again." }, { status: 500 });
  }
}

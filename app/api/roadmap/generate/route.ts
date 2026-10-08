import { NextResponse } from "next/server";
import { RoadmapSchema } from "@/lib/ai/schemas";
import { getFallbackRoadmap } from "@/lib/ai/fallback";
import { buildRoadmapUserPrompt, ROADMAP_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getProvider } from "@/lib/ai/provider";
import { parseRoadmapJson } from "@/lib/roadmap/validation";
import type { Roadmap } from "@/types/roadmap";

// Basic in-memory rate limit (per-instance, best-effort for MVP).
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 20;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
    }
    const body: unknown = await req.json().catch(() => null);
    const parsed = parseRoadmapJson(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const input = parsed.data;
    const provider = getProvider();

    if (!provider.available) {
      // Clearly labeled development fallback — never pretend it is AI output.
      const fallback: Roadmap = {
        ...getFallbackRoadmap(input.dreamJob),
        generatedAt: new Date().toISOString(),
        source: "fallback",
      };
      return NextResponse.json({
        roadmap: fallback,
        meta: { source: "fallback", reason: "AI_API_KEY is not configured." },
      });
    }

    let raw: unknown;
    try {
      raw = await provider.completeJson({
        systemPrompt: ROADMAP_SYSTEM_PROMPT,
        userPrompt: buildRoadmapUserPrompt(input),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed.";
      return NextResponse.json(
        { error: "AI generation is temporarily unavailable. Please try again.", detail: msg.slice(0, 200) },
        { status: 502 }
      );
    }

    const validated = RoadmapSchema.safeParse(raw);
    if (!validated.success) {
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    const roadmap: Roadmap = {
      ...validated.data,
      generatedAt: new Date().toISOString(),
      source: "ai",
    } as Roadmap;
    return NextResponse.json({ roadmap, meta: { source: "ai", provider: provider.name } });
  } catch {
    return NextResponse.json(
      { error: "AI generation is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

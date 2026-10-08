import { NextResponse } from "next/server";
import { NodeAdviceSchema, NodeAdviceRequestSchema } from "@/lib/ai/schemas";
import { NODE_ADVICE_SYSTEM_PROMPT, buildNodeAdvicePrompt } from "@/lib/ai/prompts";
import { getProvider } from "@/lib/ai/provider";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const parsed = NodeAdviceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const input = parsed.data;
    const provider = getProvider();
    if (!provider.available) {
      return NextResponse.json(
        { error: "AI advice is unavailable (missing API key). Roadmap exploration still works." },
        { status: 503 }
      );
    }
    let raw: unknown;
    try {
      raw = await provider.completeJson({
        systemPrompt: NODE_ADVICE_SYSTEM_PROMPT,
        userPrompt: buildNodeAdvicePrompt({
          careerGoal: input.careerGoal,
          nodeTitle: input.nodeTitle,
          nodeDescription: input.nodeDescription,
          currentSkills: input.currentSkills,
          weeklyHours: input.weeklyHours,
          timeline: input.timeline,
        }),
        maxTokens: 2000,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed.";
      return NextResponse.json(
        { error: "AI advice is temporarily unavailable. Please try again.", detail: msg.slice(0, 200) },
        { status: 502 }
      );
    }
    const validated = NodeAdviceSchema.safeParse(raw);
    if (!validated.success) {
      return NextResponse.json({ error: "AI returned an unexpected format. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ advice: validated.data, meta: { provider: provider.name } });
  } catch {
    return NextResponse.json({ error: "AI advice is temporarily unavailable. Please try again." }, { status: 500 });
  }
}

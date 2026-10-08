import { z } from "zod";
import { RoadmapInputSchema } from "@/lib/ai/schemas";

export function parseRoadmapFormData(fd: FormData) {
  const skillsRaw = String(fd.get("existingSkills") ?? "");
  const existingSkills = skillsRaw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  const data = {
    dreamJob: String(fd.get("dreamJob") ?? ""),
    industry: String(fd.get("industry") ?? ""),
    experience: String(fd.get("experience") ?? "beginner"),
    existingSkills,
    weeklyHours: Number(fd.get("weeklyHours") ?? 10),
    timeline: String(fd.get("timeline") ?? ""),
    timelineMonths: Number(fd.get("timelineMonths") ?? 6),
    learningStyle: String(fd.get("learningStyle") ?? "mixed"),
  };
  return RoadmapInputSchema.safeParse(data);
}

export function parseRoadmapJson(body: unknown) {
  const normalized = normalizeInput(body);
  return RoadmapInputSchema.safeParse(normalized);
}

function normalizeInput(body: unknown) {
  if (typeof body !== "object" || body === null) return body;
  const b = body as Record<string, unknown>;
  let skills = b.existingSkills;
  if (typeof skills === "string") {
    skills = (skills as string).split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  }
  return { ...b, existingSkills: skills };
}

export { z };

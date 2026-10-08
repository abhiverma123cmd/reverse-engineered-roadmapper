"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RoadmapInput } from "@/types/roadmap";

const TIMELINES = ["3 months", "6 months", "12 months", "18 months", "24 months"];
const HOURS = [5, 10, 15, 20, 30];

function monthsFor(timeline: string): number {
  const m = parseInt(timeline, 10);
  return Number.isFinite(m) ? Math.min(36, Math.max(1, m)) : 6;
}

export default function RoadmapForm({ onGenerating }: { onGenerating?: (loading: boolean, error?: string) => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const isExample = params.get("example") === "1";
  const [form, setForm] = useState<RoadmapInput>({
    dreamJob: params.get("job") ?? (isExample ? "Red Team Engineer at a cybersecurity company" : ""),
    industry: "",
    experience: isExample ? "beginner" : "beginner",
    existingSkills: isExample ? ["Basic Python", "Basic Linux"] : [],
    weeklyHours: isExample ? 10 : 10,
    timeline: isExample ? "6 months" : "6 months",
    timelineMonths: 6,
    learningStyle: "mixed",
  });
  const [skillsText, setSkillsText] = useState(isExample ? "Basic Python, Basic Linux" : "");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof RoadmapInput>(k: K, v: RoadmapInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const existingSkills = skillsText.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, existingSkills, timelineMonths: monthsFor(form.timeline) };
    const errs: string[] = [];
    if (payload.dreamJob.trim().length < 3) errs.push("Dream job is required (min 3 characters).");
    if (!payload.weeklyHours || payload.weeklyHours < 1) errs.push("Weekly study hours are required.");
    if (!payload.timeline.trim()) errs.push("Target timeline is required.");
    setErrors(errs);
    if (errs.length) return;
    setLoading(true);
    onGenerating?.(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Generation failed.");
      const { saveRoadmap, saveInput } = await import("@/lib/storage/roadmap-storage");
      saveRoadmap(data.roadmap);
      saveInput(payload);
      router.push("/roadmap/view");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation is temporarily unavailable. Please try again.";
      setErrors([msg]);
      onGenerating?.(false, msg);
    } finally {
      setLoading(false);
      onGenerating?.(false);
    }
  }

  function fillExample() {
    setForm({
      dreamJob: "Red Team Engineer at a cybersecurity company",
      industry: "cybersecurity",
      experience: "beginner",
      existingSkills: ["Basic Python", "Basic Linux"],
      weeklyHours: 10,
      timeline: "6 months",
      timelineMonths: 6,
      learningStyle: "mixed",
    });
    setSkillsText("Basic Python, Basic Linux");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border bg-white p-6 shadow-sm" aria-label="Roadmap input form">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Describe your dream job</h1>
        <button type="button" onClick={fillExample} className="focus-ring rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
          Try Example
        </button>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div>
        <label htmlFor="dreamJob" className="text-sm font-semibold">Dream job *</label>
        <input id="dreamJob" value={form.dreamJob} onChange={(e) => set("dreamJob", e.target.value)}
          placeholder="e.g. Red Team Engineer at a cybersecurity company"
          className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" required />
      </div>

      <div>
        <label htmlFor="industry" className="text-sm font-semibold">Target company / industry <span className="font-normal text-slate-500">(optional)</span></label>
        <input id="industry" value={form.industry ?? ""} onChange={(e) => set("industry", e.target.value)}
          placeholder="e.g. cybersecurity, climate-tech" className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Current experience *</legend>
        <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Current experience">
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={form.experience === l}
              onClick={() => set("experience", l)}
              className={`focus-ring rounded-xl border px-4 py-2 text-sm font-medium capitalize ${form.experience === l ? "border-forge-600 bg-forge-50 text-forge-700" : "hover:bg-slate-50"}`}>
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="skills" className="text-sm font-semibold">Existing skills <span className="font-normal text-slate-500">(comma-separated)</span></label>
        <textarea id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)}
          placeholder="Basic Python, Basic Linux" rows={2} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hours" className="text-sm font-semibold">Weekly study time (hrs) *</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {HOURS.map((h) => (
              <button key={h} type="button" onClick={() => set("weeklyHours", h)} aria-pressed={form.weeklyHours === h}
                className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${form.weeklyHours === h ? "border-forge-600 bg-forge-50 font-semibold text-forge-700" : "hover:bg-slate-50"}`}>
                {h}{h === 30 ? "+" : ""}
              </button>
            ))}
          </div>
          <input id="hours" type="number" min={1} max={80} value={form.weeklyHours}
            onChange={(e) => set("weeklyHours", Number(e.target.value))} className="focus-ring mt-2 w-28 rounded-xl border px-3 py-2" aria-label="Weekly study hours" />
        </div>
        <div>
          <span id="timeline-label" className="text-sm font-semibold">Target timeline *</span>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="timeline-label">
            {TIMELINES.map((t) => (
              <button key={t} type="button" onClick={() => set("timeline", t)} aria-pressed={form.timeline === t}
                className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${form.timeline === t ? "border-forge-600 bg-forge-50 font-semibold text-forge-700" : "hover:bg-slate-50"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="style" className="text-sm font-semibold">Preferred learning style <span className="font-normal text-slate-500">(optional)</span></label>
        <select id="style" value={form.learningStyle ?? "mixed"} onChange={(e) => set("learningStyle", e.target.value as RoadmapInput["learningStyle"])}
          className="focus-ring mt-1 w-full rounded-xl border px-3 py-2">
          <option value="mixed">Mixed</option>
          <option value="projects">Projects</option>
          <option value="courses">Courses</option>
          <option value="certifications">Certifications</option>
          <option value="hands-on">Hands-on practice</option>
        </select>
      </div>

      <button type="submit" disabled={loading}
        className="focus-ring w-full rounded-xl bg-forge-600 px-6 py-3 font-semibold text-white hover:bg-forge-500 disabled:opacity-60">
        {loading ? "Generating your roadmap with AI…" : "Generate Roadmap"}
      </button>
      <p className="text-center text-xs text-slate-500">AI-generated career guidance — output is validated structured JSON, not prose.</p>
    </form>
  );
}

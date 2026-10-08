"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import type { NodeAdvice, RoadmapNodeData } from "@/types/roadmap";

type Props = {
  node: (RoadmapNodeData & { phaseTitle: string }) | null;
  careerGoal: string;
  onClose: () => void;
  onStatus: (id: string, status: RoadmapNodeData["status"]) => void;
};

export default function NodeDetailsPanel({ node, careerGoal, onClose, onStatus }: Props) {
  const [advice, setAdvice] = useState<NodeAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!node) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500 shadow-sm">
        Click any milestone in the skill tree to see actionable guidance here.
      </div>
    );
  }

  async function askAI() {
    if (!node) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/node-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerGoal,
          nodeId: node.id,
          nodeTitle: node.title,
          nodeDescription: node.description,
          currentSkills: [],
          weeklyHours: 10,
          timeline: "6 months",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Advice unavailable.");
      setAdvice(data.advice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI advice is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label={`Details for ${node.title}`} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-forge-600">{node.phaseTitle}</p>
          <h2 className="mt-1 text-lg font-bold leading-snug">{node.title}</h2>
        </div>
        <button onClick={onClose} aria-label="Close details" className="focus-ring rounded-lg border p-1.5 hover:bg-slate-50">
          <X size={16} />
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600">{node.description}</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Difficulty</dt><dd>{node.difficulty}</dd></div>
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Est. hours</dt><dd>{node.estimatedHours}</dd></div>
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Type</dt><dd>{node.type}</dd></div>
        <div className="rounded-lg bg-slate-50 p-2"><dt className="font-semibold">Status</dt><dd>{node.status}</dd></div>
      </dl>

      {node.prerequisites.length > 0 && (
        <div className="mt-3 text-xs"><h3 className="font-semibold">Prerequisites</h3><ul className="list-disc pl-5">{node.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul></div>
      )}
      {node.skills.length > 0 && (
        <div className="mt-2 text-xs"><h3 className="font-semibold">Skills</h3><p>{node.skills.join(", ")}</p></div>
      )}
      {node.projects.length > 0 && (
        <div className="mt-2 text-xs"><h3 className="font-semibold">Projects</h3><ul className="list-disc pl-5">{node.projects.map((p) => <li key={p}>{p}</li>)}</ul></div>
      )}
      {node.certifications.length > 0 && (
        <div className="mt-2 text-xs"><h3 className="font-semibold">Certifications</h3><ul className="list-disc pl-5">{node.certifications.map((p) => <li key={p}>{p}</li>)}</ul></div>
      )}
      {node.interviewTopics.length > 0 && (
        <div className="mt-2 text-xs"><h3 className="font-semibold">Interview topics</h3><p>{node.interviewTopics.join(", ")}</p></div>
      )}
      {node.resources.length > 0 && (
        <div className="mt-2 text-xs"><h3 className="font-semibold">Resources</h3><ul className="list-disc pl-5">{node.resources.map((r) => <li key={r.title}>{r.title}</li>)}</ul></div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => onStatus(node.id, "completed")} className="focus-ring rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
          Mark complete / known
        </button>
        <button onClick={() => onStatus(node.id, "in-progress")} className="focus-ring rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
          Mark in progress
        </button>
        <button onClick={() => onStatus(node.id, "available")} className="focus-ring rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
          Reset
        </button>
      </div>

      <div className="mt-4 border-t pt-4">
        <button onClick={askAI} disabled={loading} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Ask AI about this milestone
        </button>
        {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
        {advice && (
          <div className="mt-3 space-y-2 text-xs">
            <div><h4 className="font-bold">What to learn</h4><ul className="list-disc pl-5">{advice.whatToLearn.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div><h4 className="font-bold">How to practice</h4><ul className="list-disc pl-5">{advice.howToPractice.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div><h4 className="font-bold">Concrete project</h4><p>{advice.concreteProject}</p></div>
            <div><h4 className="font-bold">Common mistakes</h4><ul className="list-disc pl-5">{advice.commonMistakes.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div><h4 className="font-bold">Interview questions</h4><ul className="list-disc pl-5">{advice.interviewQuestions.map((t) => <li key={t}>{t}</li>)}</ul></div>
            <div><h4 className="font-bold">Suggested next step</h4><p>{advice.nextStep}</p></div>
          </div>
        )}
      </div>
    </section>
  );
}

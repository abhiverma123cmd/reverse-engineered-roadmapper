"use client";

import { useState } from "react";
import {
  X, Loader2, Sparkles, CheckCircle2, Brain, Clock, Gauge, Link2,
  ListChecks, MessageCircleQuestion, ChevronDown,
} from "lucide-react";
import type { NodeAdvice, RoadmapNodeData } from "@/types/roadmap";

type Props = {
  node: (RoadmapNodeData & { phaseTitle: string }) | null;
  careerGoal: string;
  onClose: () => void;
  onStatus: (id: string, status: RoadmapNodeData["status"]) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-forge-600">{title}</h3>
      <div className="mt-1.5 text-sm text-slate-700">{children}</div>
    </div>
  );
}

export default function NodeDetailsPanel({ node, careerGoal, onClose, onStatus }: Props) {
  const [advice, setAdvice] = useState<NodeAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvice, setShowAdvice] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [knownMsg, setKnownMsg] = useState("");

  if (!node) {
    return (
      <div className="hidden rounded-2xl border bg-white p-5 text-sm text-slate-500 shadow-sm lg:block">
        Click any milestone in the skill tree to see actionable guidance here.
      </div>
    );
  }

  const isTarget = node.id === "__target";

  async function askAI() {
    if (!node || isTarget) return;
    if (advice) {
      setShowAdvice((s) => !s);
      return;
    }
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
      setShowAdvice(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI advice is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function mark(status: RoadmapNodeData["status"], known: boolean) {
    if (!node || isTarget) return;
    onStatus(node.id, status);
    setKnownMsg(known ? "Marked as known — downstream milestones unlocked." : "Marked complete — progress updated.");
  }

  return (
    <>
      <button aria-label="Close details" onClick={onClose} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />
      <section
        aria-label={`Details for ${node.title}`}
        className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-3xl border bg-white p-5 shadow-2xl lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-2xl lg:shadow-sm"
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-200 lg:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-forge-600">{node.phaseTitle}</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold leading-snug">
              <Brain size={20} aria-hidden className="shrink-0 text-forge-600" /> {node.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close details" className="focus-ring rounded-lg border p-1.5 hover:bg-slate-50">
            <X size={16} />
          </button>
        </div>

        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
          Status: {node.status === "completed" ? "✓ Completed" : node.status === "in-progress" ? "◐ In progress" : node.status === "locked" ? "🔒 Locked" : "→ Available"}
        </p>
        {knownMsg && <p role="status" className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">{knownMsg}</p>}

        <Section title="Why this matters">
          <p>{node.description}</p>
        </Section>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="flex items-center gap-1 font-bold text-slate-500"><Gauge size={12} aria-hidden /> DIFFICULTY</p>
            <p className="mt-0.5 font-semibold capitalize">{node.difficulty}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="flex items-center gap-1 font-bold text-slate-500"><Clock size={12} aria-hidden /> ESTIMATED TIME</p>
            <p className="mt-0.5 font-semibold">{node.estimatedHours} hours</p>
          </div>
        </div>

        {node.skills.length > 0 && (
          <Section title="What to learn">
            <ul className="flex flex-wrap gap-1.5">
              {node.skills.map((s) => (
                <li key={s} className="rounded-full bg-forge-50 px-2.5 py-1 text-xs font-semibold text-forge-700">{s}</li>
              ))}
            </ul>
          </Section>
        )}
        {node.prerequisites.length > 0 && (
          <Section title="Prerequisites">
            <p className="text-slate-600">{node.prerequisites.join(" · ")}</p>
          </Section>
        )}
        {node.projects.length > 0 && (
          <Section title="Practice project">
            <ul className="list-disc space-y-1 pl-5">{node.projects.map((p) => <li key={p}>{p}</li>)}</ul>
          </Section>
        )}
        {node.certifications.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc space-y-1 pl-5">{node.certifications.map((p) => <li key={p}>{p}</li>)}</ul>
          </Section>
        )}
        {node.interviewTopics.length > 0 && (
          <Section title="Interview topics">
            <p className="text-slate-600">{node.interviewTopics.join(" · ")}</p>
          </Section>
        )}
        {node.resources.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowResources((s) => !s)}
              aria-expanded={showResources}
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
            >
              <Link2 size={13} aria-hidden /> View Resources <ChevronDown size={13} aria-hidden className={showResources ? "rotate-180" : ""} />
            </button>
            {showResources && (
              <ul className="mt-2 space-y-1.5 text-sm">
                {node.resources.map((r) => (
                  <li key={r.title} className="rounded-xl bg-slate-50 px-3 py-2">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-forge-700 underline">
                        {r.title}
                      </a>
                    ) : (
                      <span className="font-medium">{r.title}</span>
                    )}
                    {r.kind && <span className="ml-2 text-xs text-slate-500">({r.kind})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isTarget && (
          <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
            <button onClick={() => mark("completed", false)} className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">
              <CheckCircle2 size={15} aria-hidden /> Mark Complete
            </button>
            <button onClick={() => mark("completed", true)} className="focus-ring inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-slate-50">
              <ListChecks size={15} aria-hidden /> Already Know This
            </button>
            <button onClick={() => mark("in-progress", false)} className="focus-ring rounded-xl border px-4 py-2 text-sm font-bold hover:bg-slate-50">
              Start
            </button>
          </div>
        )}

        {!isTarget && (
          <div className="mt-3 rounded-2xl bg-slate-900 p-4 text-white">
            <button onClick={askAI} disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
              <MessageCircleQuestion size={16} aria-hidden /> Ask AI
            </button>
            <p className="mt-2 text-center text-xs text-white/70">“How can I master this milestone?” — AI-generated guidance</p>
            {error && <p role="alert" className="mt-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs">{error}</p>}
            {advice && showAdvice && (
              <div className="mt-3 space-y-3 text-[13px] leading-relaxed">
                <AdviceCard title="What to learn" items={advice.whatToLearn} />
                <AdviceCard title="Practical approach" items={advice.howToPractice} />
                <div className="rounded-xl bg-white/10 p-3">
                  <h4 className="font-bold text-forge-200">Project idea</h4>
                  <p className="mt-1 text-white/90">{advice.concreteProject}</p>
                </div>
                <AdviceCard title="Common mistakes" items={advice.commonMistakes} />
                <AdviceCard title="Interview questions" items={advice.interviewQuestions} />
                <div className="rounded-xl bg-forge-500/30 p-3">
                  <h4 className="font-bold">Suggested next step</h4>
                  <p className="mt-1 text-white/90">{advice.nextStep}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function AdviceCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <h4 className="font-bold text-forge-200">{title}</h4>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-white/90">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

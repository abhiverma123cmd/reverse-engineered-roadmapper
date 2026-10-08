"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Roadmap } from "@/types/roadmap";
import { loadRoadmap, clearRoadmap } from "@/lib/storage/roadmap-storage";

const RoadmapCanvas = dynamic(() => import("@/components/roadmap/RoadmapCanvas"), {
  ssr: false,
  loading: () => <p className="rounded-2xl border bg-white p-6 text-sm">Loading interactive skill tree…</p>,
});

export default function RoadmapViewPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoadmap(loadRoadmap());
    setReady(true);
  }, []);

  if (!ready) return <main className="mx-auto max-w-6xl px-6 py-10"><p>Loading roadmap…</p></main>;

  if (!roadmap) {
    return (
      <main id="main" className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">No roadmap yet</h1>
        <p className="mt-2 text-slate-600">Generate one from your dream job first — it only takes a minute.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/roadmap" className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">Build My Roadmap</Link>
          <Link href="/roadmap?example=1" className="rounded-xl border px-5 py-2.5 font-semibold">Try Example</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:underline">← CareerForge AI</Link>
            <h1 className="text-xl font-bold leading-tight">{roadmap.careerGoal.title}</h1>
            <p className="text-sm text-slate-500">{roadmap.careerGoal.estimatedTimeline} · Target: {roadmap.finalRole}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/roadmap" className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50">New roadmap</Link>
            <button
              onClick={() => { clearRoadmap(); setRoadmap(null); }}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Clear saved
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-6 py-6">
        <RoadmapCanvas key={roadmap.generatedAt} initialRoadmap={roadmap} />
        {roadmap.successMetrics.length > 0 && (
          <section aria-label="Success metrics" className="mt-4 rounded-2xl border bg-white p-5">
            <h2 className="font-bold">How you&apos;ll know you&apos;re ready</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {roadmap.successMetrics.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import RoadmapForm from "@/components/roadmap/RoadmapForm";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-bold">← CareerForge AI</Link>
          <span className="rounded-full bg-forge-50 px-3 py-1 text-xs font-medium text-forge-700">AI-generated career guidance</span>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-4xl px-6 py-10">
        <Suspense fallback={<p>Loading form…</p>}>
          <RoadmapForm />
        </Suspense>
      </main>
    </div>
  );
}

"use client";

import { useReactFlow, Panel } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function RoadmapControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <Panel position="bottom-left" className="flex gap-2">
      <button onClick={() => zoomIn()} aria-label="Zoom in" className="focus-ring rounded-lg border bg-white p-2 shadow hover:bg-slate-50">
        <ZoomIn size={18} />
      </button>
      <button onClick={() => zoomOut()} aria-label="Zoom out" className="focus-ring rounded-lg border bg-white p-2 shadow hover:bg-slate-50">
        <ZoomOut size={18} />
      </button>
      <button onClick={() => fitView()} aria-label="Reset view" className="focus-ring rounded-lg border bg-white p-2 shadow hover:bg-slate-50">
        <Maximize size={18} />
      </button>
    </Panel>
  );
}

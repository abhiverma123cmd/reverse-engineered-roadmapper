import type { Roadmap } from "@/types/roadmap";

const ROADMAP_KEY = "careerforge.roadmap.v1";
const INPUT_KEY = "careerforge.input.v1";

function safeLS(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveRoadmap(roadmap: Roadmap): void {
  safeLS()?.setItem(ROADMAP_KEY, JSON.stringify(roadmap));
}

export function loadRoadmap(): Roadmap | null {
  try {
    const raw = safeLS()?.getItem(ROADMAP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Roadmap;
    if (!parsed || !Array.isArray(parsed.phases)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearRoadmap(): void {
  try {
    safeLS()?.removeItem(ROADMAP_KEY);
  } catch {
    /* ignore */
  }
}

export function saveInput(input: unknown): void {
  try {
    safeLS()?.setItem(INPUT_KEY, JSON.stringify(input));
  } catch {
    /* ignore */
  }
}

export function loadInput<T>(): T | null {
  try {
    const raw = safeLS()?.getItem(INPUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

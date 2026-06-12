import type { ReactNode } from "react";
import type { Question } from "@/lib/questions";

/* ─── Progress persistence (mid‑test save/resume) ─── */

const PROGRESS_KEY = "cognitive-rust-progress";
const PROGRESS_TTL = 24 * 60 * 60 * 1000; // 24h

export interface SavedProgress {
  questions: Question[];
  currentQ: number;
  answers: (number | null | number[])[];
  timeouts: boolean[];
  declared: boolean;
  aiUsage: number | null;
  timeLeft: number;
  timestamp: number;
}

export function saveProgress(data: SavedProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* storage full – non‑critical */
  }
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedProgress;
    if (Date.now() - data.timestamp > PROGRESS_TTL) {
      localStorage.removeItem(PROGRESS_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

/* ─── Render text with **emphasis** markers ─── */

export function renderEmphasized(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const ch = part.slice(2, -2);
      return (
        <span key={i} className="font-bold">
          {ch}
        </span>
      );
    }
    return part;
  });
}

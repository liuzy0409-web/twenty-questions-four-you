import type { Answers } from "./scoring";

const key = "kpop-sorting-progress-v1";
export interface Progress { answers: Answers; index: number }
export function emptyProgress(): Progress { return { answers: Array(20).fill(null), index: 0 }; }
export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.answers) || data.answers.length !== 20 || !data.answers.every((a: unknown) => a === null || (typeof a === "number" && Number.isInteger(a) && a >= 0 && a < 4)) || !Number.isInteger(data.index) || data.index < 0 || data.index > 19) return null;
    return { answers: data.answers, index: data.index };
  } catch { return null; }
}
export function saveProgress(progress: Progress) {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* Storage is optional in private browsers. */ }
}
export function clearProgress() { try { localStorage.removeItem(key); } catch { /* Continue without persistence. */ } }
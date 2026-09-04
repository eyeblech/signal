import type { LengthMode, Vibe } from "@/lib/clip";

export const AGE_KEY = "signal.age.ok";
export const PREFS_KEY = "signal.prefs";
export const SEEN_KEY = "signal.seen";

export type Prefs = {
  length: LengthMode;
  vibe: Vibe;
  autoNext: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  length: "any",
  vibe: "any",
  autoNext: true,
};

export function readAgeOk(): boolean {
  try {
    return localStorage.getItem(AGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAgeOk(): void {
  localStorage.setItem(AGE_KEY, "1");
}

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      length: parsed.length === "quick" || parsed.length === "scene" ? parsed.length : "any",
      vibe:
        parsed.vibe === "amateur" ||
        parsed.vibe === "lesbian" ||
        parsed.vibe === "soft" ||
        parsed.vibe === "hard"
          ? parsed.vibe
          : "any",
      autoNext: parsed.autoNext !== false,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writePrefs(prefs: Prefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(-60) : [];
  } catch {
    return [];
  }
}

export function pushSeen(id: string): string[] {
  const next = [...readSeen().filter((x) => x !== id), id].slice(-60);
  localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  return next;
}

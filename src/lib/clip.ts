export type SourceId = "eporner" | "pornhub" | "redgifs";
export type LengthMode = "any" | "quick" | "scene";
export type Vibe = "any" | "amateur" | "lesbian" | "soft" | "hard";

export type Clip = {
  id: string;
  source: SourceId;
  title: string;
  embedUrl: string;
  nativeUrl: string | null;
  poster: string | null;
  durationSec: number;
  sourceUrl: string;
  attribution: string;
};

export type DrawInput = {
  length: LengthMode;
  vibe: Vibe;
  seen: string[];
};

export const SOURCE_LABEL: Record<SourceId, string> = {
  eporner: "Eporner",
  pornhub: "Pornhub",
  redgifs: "RedGifs",
};

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function parseClock(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return 0;
  const parts = String(value).split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n))) return 0;
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  return parts[0] ?? 0;
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isBlockedText } from "@/lib/blocklist";
import {
  type Clip,
  type DrawInput,
  type LengthMode,
  type SourceId,
  type Vibe,
  parseClock,
} from "@/lib/clip";

const UA = "SIGNAL/1.0";
const FETCH_MS = 9000;

const DrawSchema = z.object({
  length: z.enum(["any", "quick", "scene"]),
  vibe: z.enum(["any", "amateur", "lesbian", "soft", "hard"]),
  seen: z.array(z.string()).max(80),
});

const VIBE_QUERY: Record<Vibe, string[]> = {
  any: ["amateur", "milf", "lesbian", "blowjob", "hardcore", "homemade", "pov", "anal"],
  amateur: ["amateur", "homemade", "real couple"],
  lesbian: ["lesbian", "girls"],
  soft: ["sensual", "massage", "slow"],
  hard: ["hardcore", "rough", "anal"],
};

type Candidate = Clip & { rawText: string };

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function matchesLength(sec: number, length: LengthMode): boolean {
  if (!sec) return length !== "scene";
  if (length === "quick") return sec <= 8 * 60;
  if (length === "scene") return sec >= 8 * 60;
  return true;
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "application/json", ...headers },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

let redgifsToken: { value: string; exp: number } | null = null;

async function getRedgifsToken(): Promise<string> {
  const now = Date.now();
  if (redgifsToken && redgifsToken.exp - 60_000 > now) return redgifsToken.value;
  const data = (await fetchJson("https://api.redgifs.com/v2/auth/temporary")) as {
    token?: string;
  };
  if (!data.token) throw new Error("RedGifs token missing");
  let exp = now + 12 * 60 * 60 * 1000;
  try {
    const payload = data.token.split(".")[1];
    if (payload) {
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      const parsed = JSON.parse(json) as { exp?: number };
      if (parsed.exp) exp = parsed.exp * 1000;
    }
  } catch {
    /* keep fallback */
  }
  redgifsToken = { value: data.token, exp };
  return data.token;
}

function queryFor(vibe: Vibe): string {
  return pick(VIBE_QUERY[vibe]);
}

async function fromEporner(input: DrawInput): Promise<Candidate[]> {
  const q = input.vibe === "any" && Math.random() < 0.45 ? "all" : queryFor(input.vibe);
  const order = pick(["most-popular", "latest", "top-rated", "top-weekly"] as const);
  const page = order === "latest" ? randInt(1, 80) : randInt(1, 1200);
  const data = (await fetchJson(
    `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(q)}&per_page=30&page=${page}&thumbsize=medium&order=${order}&gay=0&lq=0&format=json`,
  )) as {
    videos?: Array<{
      id: string;
      title: string;
      keywords?: string;
      url: string;
      embed: string;
      length_sec?: number;
      default_thumb?: { src?: string };
    }>;
  };
  return (data.videos ?? []).map((v) => ({
    id: `eporner:${v.id}`,
    source: "eporner" as const,
    title: v.title,
    embedUrl: `${v.embed.replace(/\/?$/, "/")}?autoplay=1`,
    nativeUrl: null,
    poster: v.default_thumb?.src ?? null,
    durationSec: Number(v.length_sec) || 0,
    sourceUrl: v.url,
    attribution: "Eporner",
    rawText: `${v.title} ${v.keywords ?? ""}`,
  }));
}

async function fromPornhub(input: DrawInput): Promise<Candidate[]> {
  const q = input.vibe === "any" ? pick(["", ...VIBE_QUERY.any]) : queryFor(input.vibe);
  const ordering = pick(["", "newest", "mostviewed"]);
  const page = randInt(1, 30);
  const params = new URLSearchParams({
    search: q,
    page: String(page),
    thumbsize: "medium",
  });
  if (ordering) params.set("ordering", ordering);
  const data = (await fetchJson(
    `https://www.pornhub.com/webmasters/search?${params.toString()}`,
  )) as {
    videos?: Array<{
      video_id: string;
      title: string;
      url: string;
      duration?: string;
      thumb?: string;
      default_thumb?: string;
      tags?: Array<{ tag_name?: string }>;
      categories?: Array<{ category?: string }>;
      segment?: string;
    }>;
  };
  return (data.videos ?? []).map((v) => {
    const tags = (v.tags ?? []).map((t) => t.tag_name ?? "").join(" ");
    const cats = (v.categories ?? []).map((c) => c.category ?? "").join(" ");
    return {
      id: `pornhub:${v.video_id}`,
      source: "pornhub" as const,
      title: v.title,
      embedUrl: `https://www.pornhub.com/embed/${v.video_id}?autoplay=1`,
      nativeUrl: null,
      poster: v.thumb || v.default_thumb || null,
      durationSec: parseClock(v.duration),
      sourceUrl: v.url,
      attribution: "Pornhub",
      rawText: `${v.title} ${tags} ${cats} ${v.segment ?? ""}`,
    };
  });
}

async function fromRedgifs(input: DrawInput): Promise<Candidate[]> {
  const token = await getRedgifsToken();
  const q = queryFor(input.vibe);
  const order = pick(["latest", "trending", "best"]);
  const page = randInt(1, 12);
  const data = (await fetchJson(
    `https://api.redgifs.com/v2/gifs/search?search_text=${encodeURIComponent(q)}&count=30&order=${order}&page=${page}`,
    { authorization: `Bearer ${token}` },
  )) as {
    gifs?: Array<{
      id: string;
      duration?: number;
      tags?: string[];
      urls?: { hd?: string; sd?: string; html?: string; poster?: string };
    }>;
  };
  return (data.gifs ?? []).map((g) => {
    const native = g.urls?.hd || g.urls?.sd || null;
    return {
      id: `redgifs:${g.id}`,
      source: "redgifs" as const,
      title: (g.tags ?? []).slice(0, 3).join(" · ") || "RedGifs",
      embedUrl: `https://www.redgifs.com/ifr/${g.id}?autoplay=1`,
      nativeUrl: native,
      poster: g.urls?.poster ?? null,
      durationSec: Number(g.duration) || 0,
      sourceUrl: `https://www.redgifs.com/watch/${g.id}`,
      attribution: "RedGifs",
      rawText: `${g.id} ${(g.tags ?? []).join(" ")}`,
    };
  });
}

function sourcesFor(length: LengthMode): SourceId[] {
  if (length === "quick") return ["redgifs", "redgifs", "redgifs", "eporner"];
  if (length === "scene") return ["eporner", "eporner", "pornhub"];
  return ["eporner", "eporner", "redgifs", "pornhub"];
}

async function pull(source: SourceId, input: DrawInput): Promise<Candidate[]> {
  if (source === "eporner") return fromEporner(input);
  if (source === "pornhub") return fromPornhub(input);
  return fromRedgifs(input);
}

function selectClip(pool: Candidate[], input: DrawInput): Clip | null {
  const seen = new Set(input.seen);
  const ok = pool.filter((c) => {
    if (seen.has(c.id)) return false;
    if (isBlockedText(c.rawText, c.title)) return false;
    if (!matchesLength(c.durationSec, input.length) && c.source !== "redgifs") {
      if (input.length === "quick" && c.durationSec > 12 * 60) return false;
      if (input.length === "scene" && c.durationSec && c.durationSec < 6 * 60) return false;
    }
    if (input.length === "scene" && c.source === "redgifs") return false;
    return true;
  });
  if (!ok.length) return null;
  const chosen = pick(ok);
  const { rawText: _drop, ...clip } = chosen;
  return clip;
}

async function drawClip(input: DrawInput): Promise<Clip> {
  const errors: string[] = [];
  const order = sourcesFor(input.length).sort(() => Math.random() - 0.5);
  for (let attempt = 0; attempt < 4; attempt++) {
    const source = order[attempt % order.length]!;
    try {
      const pool = await pull(source, input);
      const clip = selectClip(pool, input);
      if (clip) return clip;
    } catch (err) {
      errors.push(`${source}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }
  throw new Error(
    errors.length
      ? `Could not tune a signal. ${errors[0]}`
      : "Could not tune a signal. Try again.",
  );
}

export const drawNext = createServerFn({ method: "POST" })
  .validator((input: unknown) => DrawSchema.parse(input))
  .handler(async ({ data }) => drawClip(data as DrawInput));

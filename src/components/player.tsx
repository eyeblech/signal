import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Radio, Settings2, SkipForward } from "lucide-react";
import { drawNext } from "@/lib/draw-next";
import { type Clip, formatDuration, SOURCE_LABEL } from "@/lib/clip";
import {
  type Prefs,
  pushSeen,
  readPrefs,
  readSeen,
  writePrefs,
} from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import { Tuner } from "@/components/tuner";

export function Player() {
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [clip, setClip] = useState<Clip | null>(null);
  const [queued, setQueued] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [nativeFailed, setNativeFailed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const busy = useRef(false);
  const queuedRef = useRef<Clip | null>(null);
  queuedRef.current = queued;

  const fetchClip = useCallback(async (): Promise<Clip> => {
    return await drawNext({
      data: {
        length: prefs.length,
        vibe: prefs.vibe,
        seen: readSeen(),
      },
    });
  }, [prefs.length, prefs.vibe]);

  const showClip = useCallback((next: Clip) => {
    pushSeen(next.id);
    setNativeFailed(false);
    setClip(next);
    setStartedAt(Date.now());
    setNow(Date.now());
    setError(null);
    setLoading(false);
  }, []);

  const goNext = useCallback(
    async (useQueue: boolean) => {
      if (busy.current) return;
      busy.current = true;
      setLoading(true);
      setError(null);
      try {
        const ready = useQueue ? queuedRef.current : null;
        if (ready) {
          setQueued(null);
          showClip(ready);
        } else {
          showClip(await fetchClip());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signal lost.");
        setLoading(false);
      } finally {
        busy.current = false;
      }
    },
    [fetchClip, showClip],
  );

  useEffect(() => {
    setQueued(null);
    void goNext(false);
  }, [goNext]);

  useEffect(() => {
    if (!clip || queued || loading || error) return;
    let cancelled = false;
    void fetchClip()
      .then((next) => {
        if (!cancelled) setQueued(next);
      })
      .catch(() => {
        /* prefetch is optional */
      });
    return () => {
      cancelled = true;
    };
  }, [clip, queued, loading, error, fetchClip]);

  useEffect(() => {
    if (!prefs.autoNext || !clip || loading) return;
    if (clip.nativeUrl && !nativeFailed) return;
    const ms = Math.max(clip.durationSec * 1000 + 4000, 20_000);
    const wait = Math.max(ms - (Date.now() - startedAt), 8000);
    const t = window.setTimeout(() => {
      void goNext(true);
    }, wait);
    return () => window.clearTimeout(t);
  }, [clip, prefs.autoNext, loading, nativeFailed, startedAt, goNext]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        void goNext(true);
      }
      if (e.key === "Escape") setTunerOpen(false);
      if (e.key === ",") setTunerOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext]);

  const useNative = Boolean(clip?.nativeUrl) && !nativeFailed;
  const progress =
    clip && clip.durationSec > 0
      ? Math.min((now - startedAt) / 1000 / clip.durationSec, 1)
      : 0;

  return (
    <main className="relative flex min-h-dvh flex-col bg-bg text-fg">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <Radio className="size-4 text-muted" />
            <span className="font-display text-lg tracking-[-0.03em]">SIGNAL</span>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto bg-bg/40"
          aria-label="Tune"
          onClick={() => setTunerOpen(true)}
        >
          <Settings2 />
        </Button>
      </header>

      <section className="relative flex min-h-dvh flex-1 flex-col">
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-0 sm:px-6 sm:py-16">
          <div className="relative aspect-video w-full overflow-hidden bg-surface sm:rounded-lg">
            {clip && useNative ? (
              <video
                key={clip.id}
                className="size-full bg-bg object-contain"
                src={clip.nativeUrl ?? undefined}
                poster={clip.poster ?? undefined}
                autoPlay
                playsInline
                controls
                onEnded={() => {
                  if (prefs.autoNext) void goNext(true);
                }}
                onError={() => setNativeFailed(true)}
              />
            ) : clip ? (
              <iframe
                key={clip.id}
                title={clip.title}
                src={clip.embedUrl}
                className="size-full border-0 bg-bg"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/80">
                <Loader2 className="size-6 animate-spin text-muted" />
                <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
                  Tuning
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
                <p className="max-w-sm text-pretty text-sm text-muted">{error}</p>
                <Button variant="solid" onClick={() => void goNext(false)}>
                  Try again
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-border bg-bg/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">
                {clip ? SOURCE_LABEL[clip.source] : "—"}
                {clip && clip.durationSec > 0 ? ` · ${formatDuration(clip.durationSec)}` : ""}
              </p>
              <p className="mt-1 truncate text-sm text-fg">
                {clip?.title ?? "Waiting for a signal"}
              </p>
              <div className="mt-2 h-px w-full bg-border">
                <div
                  className="h-px bg-fg/70"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
            <Button
              size="lg"
              variant="solid"
              className="shrink-0 px-7"
              onClick={() => void goNext(true)}
              disabled={loading}
            >
              <SkipForward className="size-4" />
              Next
            </Button>
          </div>
          <p className="mx-auto mt-3 max-w-6xl text-xs text-fg-subtle">
            <span className="hidden sm:inline">Right arrow or N skips. Comma opens the tuner. </span>
            <Link to="/about" className="hover:text-fg">
              About
            </Link>
            {" · "}
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
          </p>
        </div>
      </section>

      <Tuner
        open={tunerOpen}
        prefs={prefs}
        onClose={() => setTunerOpen(false)}
        onChange={(next) => {
          writePrefs(next);
          setPrefs(next);
        }}
      />
    </main>
  );
}

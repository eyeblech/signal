import { X } from "lucide-react";
import type { LengthMode, Vibe } from "@/lib/clip";
import type { Prefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LENGTHS: { id: LengthMode; label: string; hint: string }[] = [
  { id: "any", label: "Anything", hint: "Clips and scenes mixed" },
  { id: "quick", label: "Quick", hint: "Short clips, skip-friendly" },
  { id: "scene", label: "Scene", hint: "Longer videos" },
];

const VIBES: { id: Vibe; label: string }[] = [
  { id: "any", label: "Open" },
  { id: "amateur", label: "Amateur" },
  { id: "lesbian", label: "Lesbian" },
  { id: "soft", label: "Soft" },
  { id: "hard", label: "Hard" },
];

export function Tuner({
  open,
  prefs,
  onClose,
  onChange,
}: {
  open: boolean;
  prefs: Prefs;
  onClose: () => void;
  onChange: (next: Prefs) => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex items-end justify-center sm:items-center",
        open ? "pointer-events-auto" : "pointer-events-none invisible",
      )}
      aria-hidden={!open}
      inert={!open}
    >
      <button
        type="button"
        aria-label="Close tuner"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-bg/70 transition-opacity duration-[var(--motion-fast)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="tuner-title"
        className={cn(
          "relative z-10 w-full max-w-md rounded-t-xl border border-border bg-surface p-5 shadow-none sm:rounded-xl",
          "transition-[opacity,transform] duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
          open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="tuner-title" className="font-display text-xl tracking-[-0.03em]">
              Tune
            </h2>
            <p className="mt-1 text-sm text-muted">
              Bias the random draw. Still one video. Still no catalog.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>

        <p className="mt-6 text-xs font-medium tracking-[0.16em] text-fg-subtle uppercase">
          Length
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {LENGTHS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...prefs, length: opt.id })}
              className={cn(
                "rounded-md border px-2 py-3 text-left transition-colors duration-[var(--motion-quick)]",
                prefs.length === opt.id
                  ? "border-fg/40 bg-fg text-bg"
                  : "border-border bg-transparent text-fg hover:bg-fg/6",
              )}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span
                className={cn(
                  "mt-1 block text-[11px] leading-snug",
                  prefs.length === opt.id ? "text-bg/70" : "text-fg-subtle",
                )}
              >
                {opt.hint}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs font-medium tracking-[0.16em] text-fg-subtle uppercase">
          Vibe
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VIBES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...prefs, vibe: opt.id })}
              className={cn(
                "h-10 rounded-full border px-4 text-sm transition-colors duration-[var(--motion-quick)]",
                prefs.vibe === opt.id
                  ? "border-fg/40 bg-fg text-bg"
                  : "border-border text-fg hover:bg-fg/6",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="mt-6 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
          <span className="text-sm">Auto-next when it ends</span>
          <input
            type="checkbox"
            checked={prefs.autoNext}
            onChange={(e) => onChange({ ...prefs, autoNext: e.target.checked })}
            className="size-4 accent-fg"
          />
        </label>
      </aside>
    </div>
  );
}

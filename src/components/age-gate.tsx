import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AgeGate({
  onEnter,
  compact = false,
}: {
  onEnter: () => void;
  compact?: boolean;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className={compact ? "mt-10" : "relative w-full max-w-md"}>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-fg"
          suppressHydrationWarning
        />
        <span className="text-sm leading-snug text-fg">
          I am 18 or older. I want to watch adult video.
        </span>
      </label>

      <Button
        size="lg"
        variant="solid"
        className="mt-4 w-full"
        disabled={!checked}
        onClick={onEnter}
      >
        Enter the channel
      </Button>

      <p className="mt-5 text-xs leading-relaxed text-fg-subtle">
        By entering you agree to the{" "}
        <Link to="/terms" className="text-muted underline underline-offset-4 hover:text-fg">
          terms
        </Link>
        . Videos play through official embeds. Nothing is uploaded or stored here.
      </p>
    </div>
  );
}

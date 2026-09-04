import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteFrame({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-fg no-underline"
          >
            <Radio className="size-4 text-muted" />
            <span className="font-display text-lg tracking-[-0.03em]">SIGNAL</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <Link to="/watch" className="hover:text-fg">
              Watch
            </Link>
            <Link to="/about" className="hover:text-fg">
              About
            </Link>
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
        {title ? (
          <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
            {title}
          </p>
        ) : null}
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-fg-subtle">
          <span>18+ adult broadcast. One video at a time.</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-fg">
              About
            </Link>
            <Link to="/terms" className="hover:text-fg">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-muted",
        "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:tracking-[-0.03em] [&_h2]:text-fg",
        "[&_h3]:mt-8 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:tracking-[0.12em] [&_h3]:text-fg [&_h3]:uppercase",
        "[&_a]:text-fg [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:decoration-fg",
        "[&_strong]:font-medium [&_strong]:text-fg",
        className,
      )}
    >
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AgeGate } from "@/components/age-gate";
import { Player } from "@/components/player";
import { SiteFrame } from "@/components/site-frame";
import { readAgeOk, writeAgeOk } from "@/lib/prefs";

export const Route = createFileRoute("/watch")({
  component: Watch,
  head: () => ({
    meta: [{ title: "Watch — SIGNAL" }],
  }),
});

function Watch() {
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(readAgeOk());
    setReady(true);
  }, []);

  if (!ready) {
    return <main className="min-h-dvh bg-bg" />;
  }

  if (!verified) {
    return (
      <SiteFrame title="Restricted">
        <h1 className="mt-4 font-display text-4xl tracking-[-0.04em]">18+ only</h1>
        <p className="mt-4 max-w-md text-muted">
          The channel is adult video. Confirm your age to watch, or read{" "}
          <Link to="/about" className="text-fg underline underline-offset-4">
            why this exists
          </Link>
          .
        </p>
        <AgeGate
          compact
          onEnter={() => {
            writeAgeOk();
            setVerified(true);
          }}
        />
      </SiteFrame>
    );
  }

  return <Player />;
}

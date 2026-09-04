import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AgeGate } from "@/components/age-gate";
import { SiteFrame } from "@/components/site-frame";
import { Button } from "@/components/ui/button";
import { readAgeOk, writeAgeOk } from "@/lib/prefs";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "SIGNAL — one video, no menu" }],
  }),
});

function Home() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (readAgeOk()) setVerified(true);
  }, []);

  return (
    <SiteFrame>
      <p className="font-mono text-xs tracking-[0.28em] text-muted uppercase">
        Channel 18
      </p>
      <h1 className="mt-4 font-display text-5xl font-medium tracking-[-0.04em] sm:text-6xl">
        SIGNAL
      </h1>
      <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted">
        Tube sites drown you in thumbnails until you cannot decide. This is the
        opposite: one adult video, then Next. No grid. No related. No hunting.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl tracking-[-0.03em]">The problem</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            You open a free porn site to watch something. You get a wall of images,
            recommended rows, and a hundred tabs. Choice is the product. You leave
            more tired than when you arrived.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl tracking-[-0.03em]">The rule</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            SIGNAL pulls a random clip from public adult tube APIs and plays it.
            The only decision is skip. An optional tuner can bias length or vibe.
            It never opens a catalog.
          </p>
        </div>
      </div>

      {verified ? (
        <div className="mt-12 max-w-md">
          <Button
            size="lg"
            variant="solid"
            className="w-full"
            onClick={() => void navigate({ to: "/watch" })}
          >
            Continue watching
          </Button>
          <p className="mt-4 text-xs text-fg-subtle">
            Already confirmed 18+. Read the{" "}
            <Link to="/about" className="underline underline-offset-4 hover:text-fg">
              intention
            </Link>{" "}
            or the{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-fg">
              terms
            </Link>
            .
          </p>
        </div>
      ) : (
        <AgeGate
          compact
          onEnter={() => {
            writeAgeOk();
            setVerified(true);
            void navigate({ to: "/watch" });
          }}
        />
      )}
    </SiteFrame>
  );
}

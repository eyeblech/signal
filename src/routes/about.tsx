import { createFileRoute, Link } from "@tanstack/react-router";
import { Prose, SiteFrame } from "@/components/site-frame";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [{ title: "About — SIGNAL" }],
  }),
});

function About() {
  return (
    <SiteFrame title="About">
      <h1 className="mt-4 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        Why this exists
      </h1>
      <Prose>
        <p>
          SIGNAL started from a simple frustration: free porn sites are built to
          keep you browsing. A thumbnail wall. A related rail. Another recommended
          row. You came to watch one thing and spent twenty minutes deciding.
        </p>
        <p>
          Decision fatigue is the product. This site is the refusal. One video
          plays. You can skip. That is the whole interface.
        </p>

        <h2>What it is</h2>
        <p>
          A random adult channel. It draws from official public webmaster APIs
          (Eporner, Pornhub, RedGifs) and plays the result through their embeds.
          Nothing is uploaded here. Nothing is scraped into a private archive.
          The draw is random, with an optional bias for length or vibe — still
          never a list of choices.
        </p>

        <h2>What it is not</h2>
        <p>
          It is not a tube. Not a search engine. Not a download site. Not a
          social feed. If you want to pick from a thousand covers, the internet
          already did that. If you want to stop picking, use{" "}
          <Link to="/watch">Watch</Link>.
        </p>

        <h2>Who it is for</h2>
        <p>
          Adults 18 and over. If you are not, leave. The{" "}
          <Link to="/terms">terms</Link> are short and binding.
        </p>
      </Prose>
    </SiteFrame>
  );
}

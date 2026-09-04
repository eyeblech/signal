import { createFileRoute, Link } from "@tanstack/react-router";
import { Prose, SiteFrame } from "@/components/site-frame";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [{ title: "Terms — SIGNAL" }],
  }),
});

function Terms() {
  return (
    <SiteFrame title="Terms">
      <h1 className="mt-4 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        Terms of use
      </h1>
      <p className="mt-3 text-sm text-fg-subtle">Last updated 3 September 2026</p>
      <Prose>
        <p>
          SIGNAL is an 18+ adult website. By entering the channel you confirm you
          are at least eighteen years old, that adult content is legal where you
          are, and that you accept these terms.
        </p>

        <h2>1. Age</h2>
        <p>
          You must be 18 or older. We do not knowingly allow minors. Age is
          confirmed by you, in your browser, and is not identity verification.
          If you are under 18, do not use this site.
        </p>

        <h2>2. What we host</h2>
        <p>
          SIGNAL does not upload, store, or sell videos. It requests metadata
          from public webmaster APIs and plays third-party embeds. Titles,
          performers, and files belong to those sources (including Eporner,
          Pornhub, and RedGifs) and their uploaders. We do not control what a
          source returns.
        </p>

        <h2>3. Your use</h2>
        <p>
          Use SIGNAL for personal, lawful viewing only. Do not attempt to
          scrape, overload, or wrap the service. Do not use it to find or share
          illegal content. We refuse anything that appears to involve anyone
          under 18 and will block matching titles and tags when we can.
        </p>

        <h2>4. No warranty</h2>
        <p>
          The site is provided as-is. Embeds can fail, autoplay can be blocked,
          and third-party players may show their own ads or related videos. We
          are not liable for content on those players, for downtime, or for
          anything you do after you leave this page.
        </p>

        <h2>5. Privacy</h2>
        <p>
          No accounts. No mailing list. Preference, age confirmation, and a
          short list of recently seen clip IDs stay in your browser’s local
          storage so Next does not repeat itself. We do not sell that. Server
          requests to third-party APIs may be logged by those providers under
          their own policies.
        </p>

        <h2>6. Copyright</h2>
        <p>
          If you are a rights holder, the file lives on the source site, not
          here. Use that site’s DMCA or report flow. You can also email the
          operator of this front-end if a particular embed should be filtered;
          include the SIGNAL clip id shown in the player chrome and the source
          URL.
        </p>

        <h2>7. Changes</h2>
        <p>
          These terms can change. The date above is the current version.
          Continued use after a change is acceptance. Questions about{" "}
          <Link to="/about">why SIGNAL exists</Link> are on the about page.
        </p>
      </Prose>
    </SiteFrame>
  );
}

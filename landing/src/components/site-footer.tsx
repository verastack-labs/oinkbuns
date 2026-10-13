import Link from "next/link";

// Verbatim from the contract. Also in README.md and NOTICE at the repo root.
const DISCLAIMER =
  "Oinkbuns is an unofficial fan project. Peppa Pig and all related characters are trademarks of Hasbro and Entertainment One. This game is not affiliated with, endorsed by, or connected to them.";

/** A grassy hill to end the page on, with the disclaimer and links. */
export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-16 w-full" aria-hidden="true">
        <path
          d="M0 80 V44 C 180 6 360 6 540 34 C 720 62 900 62 1080 30 C 1230 4 1340 10 1440 36 V80 Z"
          fill="var(--color-grass)"
          stroke="var(--color-outline)"
          strokeWidth="4"
        />
      </svg>
      <div className="bg-grass px-4 pb-10 pt-2 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <nav className="flex flex-wrap justify-center gap-3">
            <a href="/play/" className="chip">Play the game</a>
            <Link href="/devlog/" className="chip">Devlog</Link>
            <a href="https://github.com/verastack-labs/oinkbuns" className="chip">Source on GitHub</a>
          </nav>
          <p className="max-w-prose text-sm">{DISCLAIMER}</p>
          <p className="text-sm">Made with care by VeraStack Labs. No ads, no accounts, no tracking.</p>
        </div>
      </div>
    </footer>
  );
}

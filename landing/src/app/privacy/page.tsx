import type { Metadata } from "next";
import { PlayPill } from "@/components/play-pill";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Oinkbuns has no ads, no accounts, no analytics and no cookies. Nothing about a player is collected or sent anywhere. Your stars stay on your device.",
  alternates: { canonical: "/privacy/" },
};

const PROMISES = [
  ["No ads", "Nothing is sold or promoted to your child."],
  ["No accounts", "There is nothing to sign up for, and no name, email or age is ever asked."],
  ["No tracking", "No analytics, no counters and no cookies. We do not know who plays or how often."],
  ["Nothing collected", "The game never sends anything about a player to us or to anyone else."],
];

/** A plain-language note for parents. Every line here is true of the code. */
export default function Privacy() {
  return (
    <main className="flex flex-1 flex-col px-4 pb-20 pt-6">
      <article className="card-game mx-auto w-full max-w-3xl overflow-hidden">
        <div className="planks border-b-4 border-outline px-6 py-8 sm:px-10">
          <h1 className="heading-pop text-4xl font-semibold sm:text-5xl">Privacy, for grown-ups</h1>
          <p className="mt-3 text-xl">Short version: we collect nothing, and we say so because it is a game for children.</p>
        </div>
        <div className="post-body px-6 py-8 sm:px-10">
          <ul className="grid gap-4 sm:grid-cols-2">
            {PROMISES.map(([title, text]) => (
              <li key={title} className="card-game px-4 py-3">
                <strong className="text-xl text-peppa-red">{title}</strong>
                <p className="mt-1">{text}</p>
              </li>
            ))}
          </ul>
          <h2>What is saved, and where</h2>
          <p>
            Your stars and which days are unlocked are saved in your browser&apos;s local storage, on your own device. They
            never leave it. Clearing your browser data, or using a private window, starts the game fresh.
          </p>
          <h2>Offline play</h2>
          <p>
            The game can keep a copy of its own files on your device so it works without a connection. These are the
            game&apos;s pictures, sounds and code, not anything about you.
          </p>
          <h2>No other companies</h2>
          <p>
            The game and this site load everything from oinkbuns.verastack.dev. The font, pictures and sounds are our own
            copies. There are no outside scripts, embeds, fonts or content delivery networks, so visiting does not
            tell any other company that you came.
          </p>
          <h2>Our host</h2>
          <p>
            The site is hosted on GitHub Pages and the domain is served through Cloudflare. Like any website, their servers
            may keep ordinary technical logs of requests, such as an IP address, under their own policies. We do not
            receive or use that information.
          </p>
          <h2>Check for yourself</h2>
          <p>
            The code is public at <a href={REPO_URL}>{REPO_URL.replace("https://", "")}</a>. Oinkbuns is an unofficial fan
            project, not affiliated with Peppa Pig&apos;s owners.
          </p>
        </div>
      </article>
      <PlayPill />
    </main>
  );
}

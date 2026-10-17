/**
 * Facts about the site in one place, shared by page metadata, the JSON-LD
 * structured data, the visible FAQ, /llms.txt and the RSS feed, so search
 * engines, AI answer engines and people all read the same answers.
 */
export const SITE_URL = "https://oinkbuns.verastack.dev";
export const SITE_NAME = "Oinkbuns";
export const TAGLINE = "Bake hot cross buns with Peppa";
export const DESCRIPTION =
  "A tiny, free kitchen game: mix dough, bake, pipe the cross, and serve hot cross buns with Peppa. Plays on a laptop, tablet, or phone.";
export const LOGO_URL = `${SITE_URL}/play/icons/icon-512.png`;
export const REPO_URL = "https://github.com/verastack-labs/oinkbuns";
export const ORG_NAME = "VeraStack Labs";
export const ORG_URL = "https://verastack.dev";
export const DISCLAIMER =
  "Oinkbuns is an unofficial fan project. Peppa Pig and all related characters are trademarks of Hasbro and Entertainment One. This game is not affiliated with, endorsed by, or connected to them.";

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "What is Oinkbuns?",
    a: "Oinkbuns is a small, free browser game where you help Peppa run a hot cross bun kitchen. You take dough from the bowl, bake it in the oven, pipe a cross on top at the icing table, and serve each bun to a customer before they get bored.",
  },
  {
    q: "Is Oinkbuns free?",
    a: "Yes. It is completely free, with no ads, no accounts, no in-game purchases and no tracking. Just open the page and press Play.",
  },
  {
    q: "What age is Oinkbuns for?",
    a: "It is made for children aged about 7 to 8. It uses only arrow keys and one button, with short days that each add one new idea, so younger players can enjoy it with a grown-up nearby.",
  },
  {
    q: "How do you play Oinkbuns?",
    a: "Move Peppa with the arrow keys and press Space to pick up, bake, ice or serve. You can also click or tap anything in the kitchen and Peppa walks there and does it. On a phone, use the on-screen thumb pad and the one big button.",
  },
  {
    q: "What devices does Oinkbuns work on?",
    a: "Any modern web browser on a laptop, desktop, tablet or phone. Nothing to download or install. On a phone, turn it sideways to play.",
  },
  {
    q: "How many levels are there?",
    a: "Five days: First Bake, Busy Morning, Don't Burn Them!, Choc Chip Day and Grandpa's Big Order. Each day adds one twist, and you can earn up to three stars on each.",
  },
  {
    q: "Does Oinkbuns save my progress?",
    a: "Yes. Stars and unlocked days are saved in your own browser on your device. Nothing is sent to a server.",
  },
  {
    q: "Does Oinkbuns collect any information about my child?",
    a: "No. There are no accounts, no ads, no analytics, no cookies and no third-party scripts. Nothing about a player is sent anywhere. The only thing saved is your stars, kept on your own device. See the privacy note at /privacy/ for the details.",
  },
  {
    q: "Is Oinkbuns an official Peppa Pig game?",
    a: "No. Oinkbuns is an unofficial fan project and is not affiliated with, endorsed by, or connected to Hasbro or Entertainment One.",
  },
];

import { Customers } from "@/components/customers";
import { Days } from "@/components/days";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { DevlogList } from "@/components/devlog-list";
import { Hero } from "@/components/hero";
import { HowToPlay } from "@/components/how-to-play";
import { KitchenPeek } from "@/components/kitchen-peek";
import { getAllPosts } from "@/lib/devlog";
import { DESCRIPTION, REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

// What the game is, for search engines and AI answer engines.
const GAME = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "@id": `${SITE_URL}/#game`,
  name: SITE_NAME,
  description: DESCRIPTION,
  url: `${SITE_URL}/play/`,
  image: `${SITE_URL}/og.png`,
  genre: ["Casual", "Cooking", "Time management"],
  gamePlatform: ["Web browser", "Desktop", "Tablet", "Mobile"],
  applicationCategory: "Game",
  operatingSystem: "Any",
  playMode: "SinglePlayer",
  numberOfPlayers: { "@type": "QuantitativeValue", value: 1 },
  inLanguage: "en",
  isAccessibleForFree: true,
  typicalAgeRange: "7-8",
  audience: { "@type": "PeopleAudience", suggestedMinAge: 7, suggestedMaxAge: 8 },
  offers: { "@type": "Offer", price: 0, priceCurrency: "USD", availability: "https://schema.org/InStock" },
  author: { "@id": `${SITE_URL}/#org` },
  publisher: { "@id": `${SITE_URL}/#org` },
  codeRepository: REPO_URL,
  isFamilyFriendly: true,
};

/**
 * Home: the hero, a peek at the kitchen, how to play, the customers, the seven
 * days, and the latest devlog posts. Sections alternate wall tiles and floor
 * planks so the page reads like walking through the kitchen. A Server
 * Component: getAllPosts reads the content folder at build time.
 */
export default function Home() {
  const latest = getAllPosts().slice(0, 3);
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <KitchenPeek />
      <HowToPlay />
      <Customers />
      <Days />
      <DevlogList posts={latest} heading="From the devlog" showAllLink />
      <Faq />
      <JsonLd data={GAME} />
    </main>
  );
}

import { Customers } from "@/components/customers";
import { Days } from "@/components/days";
import { DevlogList } from "@/components/devlog-list";
import { Hero } from "@/components/hero";
import { HowToPlay } from "@/components/how-to-play";
import { KitchenPeek } from "@/components/kitchen-peek";
import { getAllPosts } from "@/lib/devlog";

/**
 * Home: the hero, a peek at the kitchen, how to play, the customers, the five
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
    </main>
  );
}

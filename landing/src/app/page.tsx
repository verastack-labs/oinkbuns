/**
 * Placeholder home: title, tagline, Play. The full landing page replaces
 * this with the hero, kitchen clip, how-to-play strip, customers row, and
 * devlog list. The Play link stays exactly href="/play/" (absolute, trailing
 * slash): the game is a separate static bundle next to this site, not a Next
 * route, so it is a plain anchor and not next/link.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-peppa-red sm:text-7xl">Oinkbuns</h1>
      <p className="text-2xl">Bake hot cross buns with Peppa</p>
      <a
        href="/play/"
        className="mt-4 rounded-full border-4 border-outline bg-good px-12 py-4 text-3xl font-bold text-ink"
      >
        Play
      </a>
    </main>
  );
}

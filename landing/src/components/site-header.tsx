import Link from "next/link";

/** Small top bar: the bun badge home link, the devlog, and Play. */
export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <Link href="/" className="flex items-center gap-2 text-2xl font-semibold" aria-label="Oinkbuns home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.svg" alt="" width={52} height={43} />
        <span className="text-peppa-red">Oinkbuns</span>
      </Link>
      <nav className="flex items-center gap-3">
        <Link href="/devlog/" className="chip hover:bg-wall">
          Devlog
        </Link>
        <a href="/play/" className="btn-game px-5 py-1 text-xl">
          Play
        </a>
      </nav>
    </header>
  );
}

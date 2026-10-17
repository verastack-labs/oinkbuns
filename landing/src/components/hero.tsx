import Image from "next/image";
import { PlayButton } from "@/components/play-button";

const FLOATING_BUNS = [
  { src: "/art/bun-hot-cross.svg", className: "left-[4%] top-[18%] w-14", delay: "0s" },
  { src: "/art/bun-chip-hot-cross.svg", className: "right-[6%] top-[10%] w-12", delay: "1.2s" },
  { src: "/art/bun-baked.svg", className: "left-[44%] top-[4%] w-10", delay: "2.1s" },
  { src: "/art/penny.svg", className: "right-[38%] bottom-[22%] w-9", delay: "0.6s" },
];

/** The tiled wall with the title, the Play button, and Peppa with her bun. */
export function Hero() {
  return (
    <section className="tiles relative overflow-hidden">
      {FLOATING_BUNS.map((bun) => (
        <Image
          key={bun.src}
          src={bun.src}
          alt=""
          width={64}
          height={64}
          className={`anim-float pointer-events-none absolute hidden opacity-90 sm:block ${bun.className}`}
          style={{ animationDelay: bun.delay }}
        />
      ))}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-20 px-4 pb-14 pt-6 md:flex-row md:justify-between md:gap-6 md:pt-10">
        <div className="flex max-w-xl flex-col items-center gap-5 text-center md:items-start md:text-left">
          <p className="chip -rotate-2 text-lg">A tiny kitchen game</p>
          <h1 className="title-pop text-7xl font-semibold sm:text-8xl">Oinkbuns</h1>
          <p className="text-2xl font-semibold sm:text-3xl">Bake hot cross buns with Peppa!</p>
          <p className="max-w-md text-lg">
            Mix the dough, pop it in the oven, pipe the cross, and serve your friends before they get
            hungry. Seven busy days, three stars each.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="chip">Ages 7 and up</span>
            <span className="chip">Free</span>
            <span className="chip">Laptop, tablet, phone</span>
          </div>
          <a
            href="/privacy/"
            className="card-game flex items-center gap-2 px-4 py-2 text-lg font-semibold"
          >
            <span aria-hidden="true">&#128274;</span>
            No ads. No accounts. No tracking.
            <span className="text-sm text-peppa-red-ink underline">Why you can trust that</span>
          </a>
          <PlayButton className="mt-3" />
        </div>
        <div className="relative flex items-end justify-center">
          <div className="anim-wobble absolute -top-14 right-0 z-10 md:-top-16">
            <p className="bubble text-lg">Hot cross buns!</p>
          </div>
          <Image src="/art/logo.svg" alt="" width={300} height={250} priority className="anim-bob w-60 sm:w-72" />
          <Image
            src="/art/peppa-happy.svg"
            alt="Peppa Pig with her arms up, happy"
            width={180}
            height={225}
            priority
            className="anim-bob -ml-10 w-36 sm:w-44"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
      <div className="counter-edge" />
    </section>
  );
}

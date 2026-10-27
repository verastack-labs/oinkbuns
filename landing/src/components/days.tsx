import Image from "next/image";

// The days as the game's day-select shows them. Names and twists match
// game/src/data/days/day1.json to day7.json.
const DAYS = [
  { id: 1, name: "First Bake", twist: "Learn the kitchen and serve four customers.", art: "/art/bun-dough.svg" },
  { id: 2, name: "Busy Morning", twist: "Two can queue. Who goes first?", art: "/art/bun-baked.svg" },
  { id: 3, name: "Don't Burn Them!", twist: "Grab buns when the oven dings.", art: "/art/bun-burnt.svg" },
  { id: 4, name: "Choc Chip Day", twist: "Some orders want chocolate chips.", art: "/art/bun-chip-hot-cross.svg" },
  { id: 5, name: "Grandpa's Big Order", twist: "Three in the queue, three buns at once!", art: "/art/bun-hot-cross.svg" },
  { id: 6, name: "Rush Hour", twist: "Everyone is hungry at once. Keep both ovens busy!", art: "/art/bun-chip-baked.svg" },
  { id: 7, name: "The Big Bun Party", twist: "Everyone in town, even Daddy Pig!", art: "/art/bun-chip-hot-cross.svg" },
];

function StarRow() {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <Image key={i} src="/art/star-empty.svg" alt="" width={26} height={26} />
      ))}
    </span>
  );
}

/** A level-select strip: seven days, each adding one twist. */
export function Days() {
  return (
    <section aria-labelledby="days-heading" className="tiles px-4 pb-10 pt-16">
      <h2 id="days-heading" className="heading-pop mb-3 text-center text-5xl font-semibold">
        Seven busy days
      </h2>
      <p className="mb-10 text-center text-lg font-semibold">Each day adds one new twist. Can you get every star?</p>
      <ol className="mx-auto flex max-w-6xl snap-x gap-5 overflow-x-auto px-2 pb-6 pt-2 lg:flex-wrap lg:justify-center lg:overflow-visible">
        {DAYS.map((d) => (
          <li key={d.id} className="snap-center">
            <a href="/play/" className="card-game hop flex h-full w-48 flex-col items-center gap-2 px-4 py-5 text-center">
              <span className="text-lg font-semibold text-peppa-red-ink">Day {d.id}</span>
              <Image src={d.art} alt="" width={64} height={64} />
              <span className="text-xl font-semibold leading-tight">{d.name}</span>
              <span className="text-sm">{d.twist}</span>
              <span className="mt-auto pt-2">
                <StarRow />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

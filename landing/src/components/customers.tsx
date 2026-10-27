import Image from "next/image";
import { CUSTOMERS } from "@/data/customers";

// Card tints and how patient each customer is (spec 5.5), as hearts.
const STYLE: Record<string, { bg: string; tilt: string; patience: number }> = {
  george: { bg: "bg-sky", tilt: "-rotate-2", patience: 4 },
  suzy: { bg: "bg-peppa-pink", tilt: "rotate-2", patience: 3 },
  danny: { bg: "bg-star", tilt: "-rotate-1", patience: 2 },
  grandpa: { bg: "bg-grass", tilt: "rotate-1", patience: 3 },
  mummy: { bg: "bg-star", tilt: "-rotate-1", patience: 4 },
  rebecca: { bg: "bg-sky", tilt: "rotate-2", patience: 2 },
  daddy: { bg: "bg-grass", tilt: "-rotate-2", patience: 4 },
};

function Hearts({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`Patience ${count} out of 4`}>
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3 1.7-1.8 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
            fill={i < count ? "var(--color-peppa-red)" : "var(--color-cream)"}
            stroke="var(--color-outline)"
            strokeWidth="2"
          />
        </svg>
      ))}
    </span>
  );
}

/** Collectible-card style introductions for the customers. */
export function Customers() {
  return (
    <section aria-labelledby="customers-heading" className="planks px-4 py-16">
      <h2 id="customers-heading" className="heading-pop mb-3 text-center text-5xl font-semibold">
        Meet the customers
      </h2>
      <p className="mb-10 text-center text-lg font-semibold">Everyone wants buns. Some want them faster.</p>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {CUSTOMERS.map((c) => {
          const s = STYLE[c.id];
          return (
            <li key={c.id} className={`card-game hop ${s.tilt} flex flex-col items-center overflow-hidden`}>
              <div className={`${s.bg} flex h-44 w-full items-end justify-center border-b-4 border-outline pt-4`}>
                <Image src={c.art.replace("-idle", "-happy")} alt={c.name} width={c.width} height={c.height} className="h-36 w-auto" />
              </div>
              <div className="flex w-full flex-1 flex-col items-center gap-3 px-5 pb-6 pt-4 text-center">
                <h3 className="text-2xl font-semibold">{c.name}</h3>
                <p className="bubble">&ldquo;{c.line}&rdquo;</p>
                <p className="mt-2">{c.wants}</p>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold">
                  Patience <Hearts count={s.patience} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

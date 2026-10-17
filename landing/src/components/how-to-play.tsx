import Image from "next/image";

const STEPS = [
  { title: "Bake", text: "Take dough from the bowl and pop it in the oven. Ding! It's ready.", art: "/art/oven-slot-ready.svg", w: 120, h: 80 },
  { title: "Ice", text: "Pipe a white cross on top at the icing table.", art: "/art/bun-hot-cross.svg", w: 96, h: 96 },
  { title: "Serve", text: "Hand it over before your customer gets bored. Pennies!", art: "/art/penny.svg", w: 72, h: 72 },
];

/** Three numbered steps with real game art, then the controls as keycaps. */
export function HowToPlay() {
  return (
    <section aria-labelledby="how-heading" className="tiles px-4 py-16">
      <h2 id="how-heading" className="heading-pop mb-10 text-center text-5xl font-semibold">
        How to play
      </h2>
      <ol className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card-game hop relative flex flex-col items-center px-6 pb-7 pt-10 text-center">
            <span className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-outline bg-star text-2xl font-semibold shadow-[0_4px_0_var(--color-outline)]">
              {i + 1}
            </span>
            <div className="flex h-28 items-center">
              <Image src={step.art} alt="" width={step.w} height={step.h} />
            </div>
            <h3 className="mt-2 text-3xl font-semibold text-peppa-red-ink">{step.title}</h3>
            <p className="mt-2 text-lg">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="card-game mx-auto mt-12 flex max-w-4xl flex-col items-center gap-6 px-6 py-7 md:flex-row md:justify-around">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <span className="key">&#8592;</span>
            <span className="key">&#8593;</span>
            <span className="key">&#8595;</span>
            <span className="key">&#8594;</span>
          </div>
          <span className="font-semibold">Move</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="key px-8">Space</span>
          <span className="font-semibold">Do it!</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="key px-4">Click anything</span>
          <span className="font-semibold">Peppa walks there</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="key px-4">Thumb + button</span>
          <span className="font-semibold">On a phone</span>
        </div>
      </div>
    </section>
  );
}

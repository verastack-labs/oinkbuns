/* eslint-disable @next/next/no-img-element -- absolutely positioned SVG layers sized in percent; next/image adds nothing for static SVG */

/**
 * A still of the kitchen built from the game's own art, laid out at the
 * game's 1280 by 720 positions so it looks exactly like a moment of play.
 * Each layer is placed by its centre (cx, cy) and size in game pixels.
 */
interface Layer {
  src: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  flip?: boolean;
  className?: string;
}

const W = 1280;
const H = 720;

const LAYERS: Layer[] = [
  { src: "/art/kitchen-bg.svg", cx: 640, cy: 360, w: 1280, h: 720 },
  // Customers behind the counter, with their orders above them.
  { src: "/art/george-happy.svg", cx: 400, cy: 164, w: 85, h: 102, flip: true },
  { src: "/art/suzy-idle.svg", cx: 640, cy: 155, w: 94, h: 119, flip: true },
  { src: "/art/counter.svg", cx: 640, cy: 200, w: 1280, h: 110 },
  { src: "/art/bubble.svg", cx: 640, cy: 62, w: 130, h: 70 },
  { src: "/art/bun-chip-hot-cross.svg", cx: 640, cy: 52, w: 34, h: 34 },
  { src: "/art/sparkle.svg", cx: 352, cy: 104, w: 30, h: 30, className: "anim-bob" },
  { src: "/art/sparkle.svg", cx: 448, cy: 92, w: 22, h: 22, className: "anim-bob" },
  // The kitchen floor.
  { src: "/art/bowl.svg", cx: 75, cy: 330, w: 130, h: 90 },
  { src: "/art/chip-jar.svg", cx: 75, cy: 450, w: 90, h: 110 },
  { src: "/art/oven.svg", cx: 1190, cy: 390, w: 200, h: 300 },
  { src: "/art/oven-slot-ready.svg", cx: 1190, cy: 330, w: 120, h: 80 },
  { src: "/art/oven-slot-baking.svg", cx: 1190, cy: 450, w: 120, h: 80 },
  { src: "/art/icing-table.svg", cx: 520, cy: 650, w: 220, h: 110 },
  { src: "/art/bin.svg", cx: 820, cy: 650, w: 90, h: 110 },
  // Peppa on her way to the counter with a choc-chip hot cross bun.
  { src: "/art/peppa-walk1.svg", cx: 760, cy: 395, w: 120, h: 150, className: "anim-bob" },
  { src: "/art/bun-chip-hot-cross.svg", cx: 818, cy: 392, w: 64, h: 64, className: "anim-bob" },
];

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

export function KitchenPeek() {
  return (
    <section aria-labelledby="peek-heading" className="planks px-4 py-14">
      <h2 id="peek-heading" className="heading-pop mb-8 text-center text-5xl font-semibold">
        Peek in the kitchen
      </h2>
      <a
        href="/play/"
        aria-label="Play Oinkbuns"
        className="card-game group relative mx-auto block max-w-4xl overflow-hidden p-2 sm:p-3"
        style={{ borderRadius: "2rem" }}
      >
        <div className="relative w-full overflow-hidden rounded-[1.4rem] border-4 border-outline" style={{ aspectRatio: `${W} / ${H}` }}>
          {LAYERS.map((l, i) => (
            <img
              key={`${l.src}-${i}`}
              src={l.src}
              alt=""
              className={`absolute select-none ${l.className ?? ""}`}
              style={{
                left: pct(l.cx - l.w / 2, W),
                top: pct(l.cy - l.h / 2, H),
                width: pct(l.w, W),
                height: pct(l.h, H),
                transform: l.flip ? "scaleX(-1)" : undefined,
              }}
              draggable={false}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
            <span className="btn-game scale-90 px-8 py-3 text-3xl opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Play now
            </span>
          </div>
        </div>
      </a>
      <p className="mx-auto mt-6 max-w-xl text-center text-lg font-semibold">
        Serve the order in each bubble. Quick service earns a tip!
      </p>
    </section>
  );
}

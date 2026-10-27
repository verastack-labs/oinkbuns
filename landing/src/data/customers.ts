/**
 * The seven customers as the landing page introduces them. Names and served
 * lines are the spec's (section 5.5); the art paths are the files
 * oinkbuns-internal/tools/art/export.mjs copies into public/art/, and the
 * sizes are the SVG viewBoxes so the img elements reserve the right space.
 */
export type LandingCustomerId = "george" | "suzy" | "danny" | "grandpa" | "mummy" | "rebecca" | "daddy";

export interface LandingCustomer {
  id: LandingCustomerId;
  name: string;
  line: string;
  wants: string;
  art: string;
  width: number;
  height: number;
}

export const CUSTOMERS: LandingCustomer[] = [
  {
    id: "george",
    name: "George",
    line: "Dine-saw! Grrr!",
    wants: "One bun, and he will wait for it.",
    art: "/art/george-idle.svg",
    width: 100,
    height: 120,
  },
  {
    id: "suzy",
    name: "Suzy Sheep",
    line: "Baa! Lovely!",
    wants: "One or two buns, please.",
    art: "/art/suzy-idle.svg",
    width: 110,
    height: 140,
  },
  {
    id: "danny",
    name: "Danny Dog",
    line: "Woof! Thanks!",
    wants: "Two buns, and quickly.",
    art: "/art/danny-idle.svg",
    width: 110,
    height: 140,
  },
  {
    id: "grandpa",
    name: "Grandpa Pig",
    line: "Ho ho, splendid!",
    wants: "Three buns on the last day.",
    art: "/art/grandpa-idle.svg",
    width: 130,
    height: 160,
  },
  {
    id: "mummy",
    name: "Mummy Pig",
    line: "Lovely, darling!",
    wants: "One or two buns, from day 6.",
    art: "/art/mummy-idle.svg",
    width: 120,
    height: 150,
  },
  {
    id: "rebecca",
    name: "Rebecca Rabbit",
    line: "Hoppy day!",
    wants: "Two buns, and she hops off fast.",
    art: "/art/rebecca-idle.svg",
    width: 110,
    height: 140,
  },
  {
    id: "daddy",
    name: "Daddy Pig",
    line: "Ho ho! Delicious!",
    wants: "Two or three buns, on the party day.",
    art: "/art/daddy-idle.svg",
    width: 130,
    height: 160,
  },
];

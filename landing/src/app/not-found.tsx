import Image from "next/image";
import Link from "next/link";
import { PlayButton } from "@/components/play-button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Image src="/art/george-sad.svg" alt="George looking sad" width={120} height={144} />
      <h1 className="heading-pop text-5xl font-semibold">Nothing baking here</h1>
      <p className="max-w-md text-xl">That page does not exist. The kitchen is this way.</p>
      <PlayButton />
      <Link href="/" className="chip">
        Back to the front page
      </Link>
    </main>
  );
}

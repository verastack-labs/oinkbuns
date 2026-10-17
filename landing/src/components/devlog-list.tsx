import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/devlog";

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Devlog posts as pinned recipe cards. */
export function DevlogList({ posts, heading, showAllLink = false }: { posts: Post[]; heading: string; showAllLink?: boolean }) {
  return (
    <section aria-labelledby="devlog-heading" className="px-4 pb-16 pt-4">
      <h2 id="devlog-heading" className="heading-pop mb-10 text-center text-5xl font-semibold">
        {heading}
      </h2>
      <ul className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link
              href={`/devlog/${post.slug}/`}
              className={`card-game hop flex h-full flex-col overflow-hidden ${i % 2 ? "rotate-1" : "-rotate-1"}`}
            >
              <div className="tiles flex h-36 items-end justify-center border-b-4 border-outline pt-3">
                {post.cover ? <Image src={post.cover} alt="" width={96} height={120} className="h-28 w-auto" /> : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                <time dateTime={post.date} className="text-sm font-semibold text-peppa-red-ink">
                  {formatDate(post.date)}
                </time>
                <h3 className="text-2xl font-semibold leading-tight">{post.title}</h3>
                <p>{post.summary}</p>
                <span className="mt-auto pt-2 font-semibold text-george-blue-ink">Read it &rarr;</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {showAllLink ? (
        <p className="mt-10 text-center">
          <Link href="/devlog/" className="chip text-lg">
            All devlog posts
          </Link>
        </p>
      ) : null}
    </section>
  );
}

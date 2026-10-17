import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/components/devlog-list";
import { JsonLd } from "@/components/json-ld";
import { PlayPill } from "@/components/play-pill";
import { getAllPosts, getPost } from "@/lib/devlog";
import { SITE_URL } from "@/lib/site";

// Every post is a folder with an index.html in the static export. Unknown
// slugs are never rendered: with dynamicParams false they fall through to
// the site's 404 page, which is what a static host serves anyway.
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/devlog/${slug}/` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      url: `/devlog/${slug}/`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return (
    <main className="flex flex-1 flex-col px-4 pb-20 pt-6">
      <article className="card-game mx-auto w-full max-w-3xl overflow-hidden">
        <div className="planks flex items-end justify-between gap-4 border-b-4 border-outline px-6 pt-6 sm:px-10">
          <Link href="/devlog/" className="chip mb-6 self-start bg-cream">
            &larr; All posts
          </Link>
          {post.cover ? <Image src={post.cover} alt="" width={120} height={150} className="h-32 w-auto" priority /> : null}
        </div>
        <div className="px-6 py-8 sm:px-10">
          <header className="mb-8">
            <time dateTime={post.date} className="text-sm font-semibold text-peppa-red-ink">
              {formatDate(post.date)}
            </time>
            <h1 className="heading-pop mt-2 text-4xl font-semibold sm:text-5xl">{post.title}</h1>
            <p className="mt-4 text-xl">{post.summary}</p>
          </header>
          {/* remark-html output with sanitize on, so this is Markdown we wrote
              with any raw HTML already stripped. */}
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>
      <PlayPill />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          url: `${SITE_URL}/devlog/${slug}/`,
          mainEntityOfPage: `${SITE_URL}/devlog/${slug}/`,
          image: `${SITE_URL}/og.png`,
          inLanguage: "en",
          author: { "@id": `${SITE_URL}/#org` },
          publisher: { "@id": `${SITE_URL}/#org` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@id": `${SITE_URL}/#game` },
        }}
      />
    </main>
  );
}

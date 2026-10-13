import { getAllPosts } from "@/lib/devlog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// RSS 2.0 feed of the devlog, written at build time.
export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET(): Response {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/devlog/${p.slug}/`;
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${esc(p.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} devlog</title>
    <link>${SITE_URL}/devlog/</link>
    <atom:link href="${SITE_URL}/devlog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on making ${SITE_NAME}, a tiny hot cross bun kitchen game.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

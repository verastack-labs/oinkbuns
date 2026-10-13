import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/devlog";

export const dynamic = "force-static";

const SITE_URL = "https://oinkbuns.verastack.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.date;
  return [
    { url: `${SITE_URL}/`, lastModified: newest, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/play/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/devlog/`, lastModified: newest, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/devlog/${post.slug}/`,
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

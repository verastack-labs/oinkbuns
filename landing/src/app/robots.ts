import type { MetadataRoute } from "next";

// Metadata route handlers must be marked static under output: 'export'.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://oinkbuns.verastack.dev/sitemap.xml",
  };
}

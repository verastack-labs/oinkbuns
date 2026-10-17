import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DESCRIPTION, LOGO_URL, ORG_NAME, ORG_URL, REPO_URL, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/devlog/feed.xml", title: `${SITE_NAME} devlog` }] },
  },
  keywords: ["hot cross bun game", "Peppa Pig fan game", "kids cooking game", "free browser game for kids", "baking game"],
  authors: [{ name: ORG_NAME, url: ORG_URL }],
  creator: ORG_NAME,
  category: "games",
  robots: { index: true, follow: true },
  icons: { icon: "/art/logo.svg" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Oinkbuns: Peppa with a hot cross bun and her customers" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#fff1d6",
};

// Typed explicitly rather than with Next's generated LayoutProps, which only
// exists after a build has run; CI typechecks before building.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="tiles flex min-h-svh flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: ORG_NAME, url: ORG_URL, logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 }, sameAs: [REPO_URL] },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: `${SITE_URL}/`,
                name: SITE_NAME,
                description: DESCRIPTION,
                inLanguage: "en",
                publisher: { "@id": `${SITE_URL}/#org` },
              },
            ],
          }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

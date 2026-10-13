import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const SITE_URL = "https://oinkbuns.verastack.dev";
const SITE_NAME = "Oinkbuns";
const TAGLINE = "Bake hot cross buns with Peppa";
const DESCRIPTION =
  "A tiny, free kitchen game: mix dough, bake, pipe the cross, and serve hot cross buns with Peppa. Plays on a laptop, tablet, or phone.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
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
    <html lang="en" className="h-full antialiased">
      <body className="tiles flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

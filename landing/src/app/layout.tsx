import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const SITE_URL = "https://oinkbuns.verastack.dev";
const SITE_NAME = "Oinkbuns";
const TAGLINE = "Bake hot cross buns with Peppa";

// Verbatim from the contract. Also in README.md and NOTICE at the repo root.
const DISCLAIMER =
  "Oinkbuns is an unofficial fan project. Peppa Pig and all related characters are trademarks of Hasbro and Entertainment One. This game is not affiliated with, endorsed by, or connected to them.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description:
    "A small browser game in which Peppa Pig bakes and serves hot cross buns. Free to play on a laptop, phone, or tablet.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

// Typed explicitly rather than with Next's generated `LayoutProps`, which
// only exists after a build has run. CI typechecks before building, so
// depending on it makes the check fail on a clean checkout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <footer className="mt-auto px-4 py-8 text-center text-sm">
          <p className="mx-auto max-w-prose">{DISCLAIMER}</p>
          <p className="mt-2">
            <a
              href="https://github.com/verastack-labs/oinkbuns"
              className="underline"
            >
              Source on GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

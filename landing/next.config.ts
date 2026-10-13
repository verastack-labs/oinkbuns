import type { NextConfig } from "next";

/**
 * Built as a static export for GitHub Pages.
 *
 * Served from the root of its own domain, `oinkbuns.verastack.dev`. `basePath`
 * is still read from an env var, empty in every build today, so serving it
 * under a project path again would be a config change rather than a find and
 * replace.
 *
 * `images.unoptimized` is required: the Next image optimiser needs a server,
 * and a static export has none.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // `next build` and `next dev` share `.next` by default, and a build run
  // while dev is up leaves the dev server serving chunks that no longer
  // exist. Giving the build its own directory makes the two impossible to
  // collide.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  basePath,
  // Without this, GitHub Pages serves /about as a 404 rather than finding
  // /about/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

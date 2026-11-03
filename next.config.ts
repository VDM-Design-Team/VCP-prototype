import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* A static site in out/: the prototype has no server, and Cloudflare Pages
     serves the files as they are. */
  output: "export",
  /* No cacheComponents / partialPrefetching: they are for a server, and
     with them on `next build` can't prerender the [screen] pages. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

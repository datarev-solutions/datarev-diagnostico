import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Turbopack infer the wrong
  // workspace root; pin it to this project.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  async rewrites() {
    // The three Labs are static exports living under public/labs/**. Next's
    // static file server only matches exact paths — it does not resolve a
    // directory request to its index.html the way a plain web server would.
    // A blanket "/labs/:path+" rewrite would also catch every asset request
    // (advanced-rag.js, brand/datarev-logo.png, _next/...) and misroute those
    // to a nonexistent index.html/<file> path, so instead this lists the
    // actual page-shaped routes: the three lab entry points, plus the one
    // nested page the agentic-stack export has (/skills). Next also strips a
    // trailing slash before rewrites run (trailingSlash defaults to false),
    // which is why the sources below have none even though the exported HTML
    // links with one.
    const labPages = [
      "/labs/rag-simulator",
      "/labs/agent-governance",
      "/labs/agentic-stack",
      "/labs/agentic-stack/skills",
    ];
    return labPages.map((source) => ({
      source,
      destination: `${source}/index.html`,
    }));
  },
};

export default nextConfig;

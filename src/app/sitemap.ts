import type { MetadataRoute } from "next";
import content from "@/content/content.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://priyadeep-portfolio.vercel.app";
  return [
    { url: base, priority: 1 },
    { url: `${base}/classic`, priority: 0.9 },
    { url: `${base}/experience`, priority: 0.7 },
    { url: `${base}/achievements`, priority: 0.7 },
    { url: `${base}/about`, priority: 0.6 },
    ...content.projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      priority: 0.8,
    })),
  ];
}

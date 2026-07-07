import baseContent from "./content.json";
import type { Content } from "./types";

/**
 * Content resolution (APEX→ODYSSEY contract v1):
 *  1. `FEED_URL` env — fetched at build time, validated
 *  2. `public/feed.json` — drop-in static file, validated
 *  3. `src/content/content.json` — generated from ../main.tex (always present)
 */
export async function getContent(): Promise<Content> {
  const url = process.env.FEED_URL;
  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = (await res.json()) as Content;
        if (isValid(data)) return data;
        console.warn("[content] FEED_URL failed validation; using content.json");
      }
    } catch {
      console.warn("[content] FEED_URL unreachable; using content.json");
    }
  }
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const raw = await fs.readFile(
      path.join(process.cwd(), "public", "feed.json"),
      "utf-8"
    );
    const data = JSON.parse(raw) as Content;
    if (isValid(data)) return data;
    console.warn("[content] public/feed.json failed validation; using content.json");
  } catch {
    // no feed — normal until APEX publishes one
  }
  return baseContent as Content;
}

function isValid(data: unknown): data is Content {
  if (!data || typeof data !== "object") return false;
  const c = data as Partial<Content>;
  return (
    c.version === "v1" &&
    !!c.basics?.name &&
    !!c.basics?.email &&
    Array.isArray(c.projects) &&
    c.projects.length > 0 &&
    c.projects.every(
      (p) => !!p?.name && !!p?.slug && Array.isArray(p?.highlights)
    ) &&
    Array.isArray(c.work) &&
    Array.isArray(c.awards) &&
    Array.isArray(c.skills) &&
    Array.isArray(c.volunteer)
  );
}

import { seedResume } from "./resume";
import type { Resume } from "./types";

/**
 * APEX→ODYSSEY feed contract (v1): prefer a `feed.json` published by APEX,
 * fall back to the local seed transcribed from main.tex.
 *
 * Sources, in order:
 *  1. `FEED_URL` env — fetched at build time (SSG) with a short timeout.
 *  2. `public/feed.json` — drop-in static file.
 *  3. `seedResume` — always present, always complete.
 */
export async function getResume(): Promise<Resume> {
  const url = process.env.FEED_URL;
  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = (await res.json()) as Resume;
        if (isValidFeed(data)) return data;
        console.warn("[feed] FEED_URL responded but failed validation; using seed");
      }
    } catch {
      console.warn("[feed] FEED_URL unreachable; using seed");
    }
  }
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const raw = await fs.readFile(
      path.join(process.cwd(), "public", "feed.json"),
      "utf-8"
    );
    const data = JSON.parse(raw) as Resume;
    if (isValidFeed(data)) return data;
    console.warn("[feed] public/feed.json failed validation; using seed");
  } catch {
    // no static feed — normal until APEX publishes one
  }
  return seedResume;
}

/** Light structural validation — enough to reject a malformed feed without a schema dep. */
function isValidFeed(data: unknown): data is Resume {
  if (!data || typeof data !== "object") return false;
  const r = data as Partial<Resume>;
  return (
    r.version === "v1" &&
    !!r.basics?.name &&
    Array.isArray(r.projects) &&
    r.projects.length > 0 &&
    r.projects.every((p) => !!p?.name && !!p?.slug && Array.isArray(p?.highlights)) &&
    Array.isArray(r.work) &&
    Array.isArray(r.awards) &&
    Array.isArray(r.skills)
  );
}

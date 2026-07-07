import type { Metadata } from "next";
import content from "@/content/content.json";
import Home from "../../page";

export function generateStaticParams() {
  return content.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = content.projects.find((p) => p.slug === slug);
  return {
    title: `Priyadeep Jaiswal — ${project?.name ?? "Project"}`,
    description: project?.oneLiner,
    alternates: { canonical: `/projects/${slug}` },
  };
}

/** deep link: same world, flies to this project's showcase after Enter */
export default Home;

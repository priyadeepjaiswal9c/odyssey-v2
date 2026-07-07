import { getContent } from "@/content/loader";
import { ResumeCore } from "@/ui/ResumeCore";
import { WorldGate } from "@/world/WorldGate";

export default async function Home() {
  const content = await getContent();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.basics.name,
    email: content.basics.email,
    jobTitle: content.basics.whatIDo,
    url: content.basics.profiles.find((p) => p.network === "GitHub")?.url,
    sameAs: content.basics.profiles.map((p) => p.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: content.basics.location,
    },
    alumniOf: content.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
    })),
  };

  return (
    <>
      <a className="skip-link" href="#text-core">
        Skip to text résumé
      </a>
      {/* the voxel world layers itself above when the device can carry it */}
      <WorldGate content={content} />
      {/* the SSR text core — always present, always complete */}
      <ResumeCore content={content} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

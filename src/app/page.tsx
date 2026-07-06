import { getResume } from "@/content/loader";
import { ResumeCore } from "@/ui/ResumeCore";
import { WorldGate } from "@/world/WorldGate";

export default async function Home() {
  const resume = await getResume();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.basics.name,
    email: resume.basics.email,
    jobTitle: resume.basics.label,
    url: resume.basics.profiles.find((p) => p.network === "GitHub")?.url,
    sameAs: resume.basics.profiles.map((p) => p.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: resume.basics.location.city,
      addressRegion: resume.basics.location.region,
      addressCountry: resume.basics.location.countryCode,
    },
    alumniOf: resume.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
    })),
  };

  return (
    <>
      {/* the voxel world layers itself above when the device can carry it */}
      <WorldGate resume={resume} />
      {/* the SSR text core — always present, always complete */}
      <ResumeCore resume={resume} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

import { useSiteContent } from "./siteContent";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "../lib/seo";

export function StudioJsonLd() {
  const settings = useSiteContent()?.settings;
  const data = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: settings?.studioBody?.split("\n\n")[0] || SITE_DESCRIPTION,
    image: `${SITE_ORIGIN}/logo.png`,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

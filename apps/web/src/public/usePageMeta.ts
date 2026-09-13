import { useEffect } from "react";
import { setMeta, SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";

export function usePageMeta(title: string, description = SITE_DESCRIPTION) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    return () => {
      document.title = SITE_NAME;
      setMeta("description", SITE_DESCRIPTION);
      setMeta("og:title", SITE_NAME, "property");
      setMeta("og:description", SITE_DESCRIPTION, "property");
    };
  }, [title, description]);
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";
import type { SiteContent, SiteEntry, SiteEntryKind } from "../types";

const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteContent | null>(null);
  useEffect(() => {
    api
      .getPublicSite()
      .then((data) => setSite(data.site))
      .catch(() => setSite(null));
  }, []);
  return <SiteContentContext.Provider value={site}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function entriesOf(site: SiteContent | null, kind: SiteEntryKind): SiteEntry[] {
  return site?.entries.filter((entry) => entry.kind === kind) ?? [];
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";
import type { SiteContent, SiteEntry, SiteEntryKind } from "../types";

const SiteContentContext = createContext<{ site: SiteContent | null; ready: boolean }>({
  site: null,
  ready: false,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteContent | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api
      .getPublicSite()
      .then((data) => setSite(data.site))
      .catch(() => setSite(null))
      .finally(() => setReady(true));
  }, []);
  return <SiteContentContext.Provider value={{ site, ready }}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext).site;
}

export function useSiteReady() {
  return useContext(SiteContentContext).ready;
}

export function entriesOf(site: SiteContent | null, kind: SiteEntryKind): SiteEntry[] {
  return site?.entries.filter((entry) => entry.kind === kind) ?? [];
}

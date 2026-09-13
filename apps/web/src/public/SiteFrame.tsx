import { useEffect, type ReactNode } from "react";
import { EnquireFloat } from "./EnquireCta";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { useSiteReveal } from "./useSiteReveal";

export function SiteFrame({ children }: { children: ReactNode }) {
  useSiteReveal();
  useEffect(() => {
    document.documentElement.classList.add("site");
    const id = requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
    return () => {
      cancelAnimationFrame(id);
      document.documentElement.classList.remove("site", "is-ready");
    };
  }, []);

  return (
    <div className="site min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
      <EnquireFloat />
    </div>
  );
}

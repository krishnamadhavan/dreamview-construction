import { useEffect } from "react";

export function useSiteReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = () => document.querySelectorAll(".site-in, .site-mask");

    if (reduced || !("IntersectionObserver" in window)) {
      targets().forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    const watch = () => {
      targets().forEach((el) => {
        if (!el.classList.contains("is-in")) io.observe(el);
      });
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

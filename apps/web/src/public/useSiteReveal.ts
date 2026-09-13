import { useEffect } from "react";

export function useSiteReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = () => document.querySelectorAll(".site-in, .site-mask");

    const countUp = (el: HTMLElement) => {
      const to = Number(el.dataset.count || 0);
      if (!Number.isFinite(to) || el.dataset.counted === "1") return;
      el.dataset.counted = "1";
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        el.textContent = String(Math.round(to * (1 - (1 - t) ** 3))).padStart(2, "0");
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (reduced || !("IntersectionObserver" in window)) {
      targets().forEach((el) => {
        el.classList.add("is-in");
        el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          entry.target.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
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

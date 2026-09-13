import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MediaImage } from "../components/MediaImage";
import { DEFAULT_HERO_COVER, resolveHeroCover } from "../lib/hero";
import type { PublicProject } from "../types";

type Slide = {
  id: string;
  title: string;
  slug: string | null;
  url: string;
  alt: string;
};

export function HeroSlideshow({ projects, coverUrl = "" }: { projects: PublicProject[]; coverUrl?: string }) {
  const projectSlides: Slide[] = projects
    .filter((project) => project.images[0])
    .map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      url: project.images[0]?.url ?? "",
      alt: project.images[0]?.alt || project.title,
    }));
  const requestedCover = resolveHeroCover(coverUrl);
  const [paintedCover, setPaintedCover] = useState(DEFAULT_HERO_COVER);
  const cover: Slide = {
    id: "hero-cover",
    title: "Dreamview",
    slug: null,
    url: paintedCover,
    alt: "Dreamview",
  };
  const slides = [cover, ...projectSlides].slice(0, 6);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [offset, setOffset] = useState(0);
  const [coverReady, setCoverReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setPaintedCover(requestedCover);
      setCoverReady(true);
    };
    image.onerror = () => {
      if (cancelled) return;
      setPaintedCover(DEFAULT_HERO_COVER);
      setCoverReady(true);
    };
    image.src = requestedCover;
    if (image.complete && image.naturalWidth > 0) {
      setPaintedCover(requestedCover);
      setCoverReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [requestedCover]);

  useEffect(() => {
    setIndex(0);
    setPrev(null);
  }, [paintedCover]);

  useEffect(() => {
    const onScroll = () => setOffset(Math.min(window.scrollY, window.innerHeight) * 0.42);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!coverReady || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        setPrev(current);
        return (current + 1) % slides.length;
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [coverReady, slides.length]);

  const active = slides[index];

  return (
    <section className="site-hero">
      <div className="site-hero-parallax" style={{ transform: `translate3d(0, ${offset}px, 0)` }}>
        {slides.map((slide, i) => (
          <figure
            key={slide.id}
            className={`site-hero-slide ${i === index ? "is-on" : ""} ${i === prev && i !== index ? "is-out" : ""}`}
          >
            <MediaImage
              url={slide.url}
              alt={slide.alt}
              fit="hero"
              fetchPriority={i === 0 ? "high" : "low"}
              className="site-hero-img h-full w-full object-cover"
            />
          </figure>
        ))}
        {slides.length === 0 && <div className="absolute inset-0 bg-[#111]" />}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-void via-void/50 to-void/20" />
      </div>

      <div className="site-shell relative z-[6] flex min-h-[100svh] flex-col justify-end pb-[11vh]">
        <p className={`site-kicker ${ready ? "site-fade" : ""}`} style={{ animationDelay: "0.15s" }}>
          Construction practice
        </p>
        <h1 className="display mt-4 text-[clamp(3.6rem,9vw,8rem)] leading-none">
          <span className="site-cut">
            <span>We build</span>
          </span>
          <span className="site-cut">
            <span className="italic text-gold">great</span>
          </span>
          <span className="site-cut">
            <span>buildings.</span>
          </span>
        </h1>
        <p className={`mt-6 max-w-lg text-[15px] leading-7 text-paper/75 ${ready ? "site-fade" : ""}`} style={{ animationDelay: "0.55s" }}>
          Structure first, then the rooms people inhabit. One team from the first walk of the plot to handover.
        </p>
        <div className={`mt-8 flex flex-wrap items-center gap-7 ${ready ? "site-fade" : ""}`} style={{ animationDelay: "0.7s" }}>
          <a href="#work" className="border-b border-current pb-0.5 text-[12px] tracking-[0.2em] uppercase">
            See the work
          </a>
          <a href="#contact" className="text-[12px] tracking-[0.2em] text-paper/50 uppercase hover:text-paper">
            Start a project
          </a>
        </div>
        {active && (
          <div className={`mt-10 flex items-center gap-5 ${ready ? "site-fade" : ""}`} style={{ animationDelay: "0.85s" }}>
            <div className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.title}`}
                  onClick={() => {
                    setPrev(index);
                    setIndex(i);
                  }}
                  className={`h-[3px] w-7 ${i === index ? "bg-gold" : "bg-paper/25"}`}
                />
              ))}
            </div>
            {active.slug ? (
              <Link to={`/projects/${active.slug}`} className="text-[11px] tracking-[0.2em] text-paper/50 uppercase hover:text-paper">
                {String(index + 1).padStart(2, "0")} · {active.title}
              </Link>
            ) : (
              <p className="text-[11px] tracking-[0.2em] text-paper/50 uppercase">
                {String(index + 1).padStart(2, "0")} · Cover
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

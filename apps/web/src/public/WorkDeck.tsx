import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { MediaImage } from "../components/MediaImage";
import { projectKindLabel } from "../lib/projectKind";
import type { PublicProject } from "../types";

export function WorkDeck({ projects }: { projects: PublicProject[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const drag = useRef({ hold: false, x: 0, left: 0, moved: 0 });

  function nearestIndex() {
    const track = trackRef.current;
    if (!track) return 0;
    const mid = track.scrollLeft + track.clientWidth / 2;
    const slides = [...track.querySelectorAll<HTMLElement>("[data-slide]")];
    let best = 0;
    let dist = Infinity;
    slides.forEach((slide, i) => {
      const c = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }

  function sync() {
    setCurrent(nearestIndex());
  }

  function go(dir: number) {
    const track = trackRef.current;
    if (!track) return;
    const slides = [...track.querySelectorAll<HTMLElement>("[data-slide]")];
    const i = Math.min(slides.length - 1, Math.max(0, current + dir));
    slides[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => requestAnimationFrame(sync);
    track.addEventListener("scroll", onScroll, { passive: true });
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      track.scrollLeft += event.deltaY;
      event.preventDefault();
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
    };
  }, []);

  function onDown(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { hold: true, x: event.clientX, left: track.scrollLeft, moved: 0 };
    track.classList.add("is-drag");
    track.setPointerCapture(event.pointerId);
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.hold) return;
    drag.current.moved = drag.current.x - event.clientX;
    track.scrollLeft = drag.current.left + drag.current.moved;
  }

  function onUp() {
    const track = trackRef.current;
    if (!track || !drag.current.hold) return;
    drag.current.hold = false;
    track.classList.remove("is-drag");
    const slides = [...track.querySelectorAll<HTMLElement>("[data-slide]")];
    const index = nearestIndex();
    setCurrent(index);
    slides[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  if (projects.length === 0) return null;

  return (
    <div>
      <div
        ref={trackRef}
        className="site-deck"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {projects.map((project, index) => {
          const cover = project.images[0];
          return (
            <Link
              key={project.id}
              data-slide
              to={`/projects/${project.slug}`}
              onClick={(event) => {
                if (Math.abs(drag.current.moved) > 8) event.preventDefault();
              }}
              className="site-slide text-paper"
            >
              {cover ? (
                <MediaImage url={cover.url} alt={cover.alt || project.title} fit="twoThirds" className="h-full w-full object-cover transition duration-1000 hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-[11px] tracking-[0.2em] uppercase text-paper/40">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
              <div className="absolute inset-x-7 bottom-6">
                <p className="site-kicker">
                  {String(index + 1).padStart(2, "0")} · {projectKindLabel(project.kind)}
                  {project.location ? ` · ${project.location}` : ""}
                </p>
                <h2 className="display mt-2 text-4xl">{project.title}</h2>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="site-shell mt-2 flex items-center justify-between">
        <p className="text-[12px] tracking-[0.18em] text-paper/40 uppercase">
          {String(current + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous" disabled={current === 0} onClick={() => go(-1)} className="h-11 w-11 border border-white/15 text-paper disabled:opacity-30">
            ←
          </button>
          <button type="button" aria-label="Next" disabled={current === projects.length - 1} onClick={() => go(1)} className="h-11 w-11 border border-white/15 text-paper disabled:opacity-30">
            →
          </button>
        </div>
      </div>
    </div>
  );
}

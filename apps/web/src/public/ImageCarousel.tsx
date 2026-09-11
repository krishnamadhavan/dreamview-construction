import { useState, type PointerEvent } from "react";
import { MediaImage } from "../components/MediaImage";
import type { ImageFit } from "../lib/cloudinary";
import type { PublicProjectImage } from "../types";

export function ImageCarousel({
  images,
  title,
  aspect = "aspect-[4/3]",
  fit = "half",
}: {
  images: PublicProjectImage[];
  title: string;
  aspect?: string;
  fit?: ImageFit;
}) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState<number | null>(null);
  const current = images[index];
  const count = images.length;

  function go(next: number) {
    if (count === 0) return;
    setIndex((next + count) % count);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    setDragX(event.clientX);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragX === null || count < 2) return;
    const delta = event.clientX - dragX;
    setDragX(null);
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? index + 1 : index - 1);
  }

  if (!current) {
    return (
      <div className={`flex ${aspect} items-center justify-center bg-sand text-[11px] tracking-[0.2em] text-ink-soft uppercase`}>
        Photography forthcoming
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-sand ${aspect} select-none`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragX(null)}
    >
      <MediaImage
        url={current.url}
        alt={current.alt || title}
        fit={fit}
        draggable={false}
        className="h-full w-full object-cover"
      />
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(index - 1);
            }}
            className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(index + 1);
            }}
            className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink hover:bg-paper"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5">
            {images.map((image, dot) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Show image ${dot + 1}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIndex(dot);
                }}
                className={`h-1.5 rounded-full transition ${
                  dot === index ? "w-5 bg-paper" : "w-1.5 bg-paper/50 hover:bg-paper/80"
                }`}
              />
            ))}
          </div>
          <p className="absolute top-3 right-3 z-10 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-[10px] tracking-wide text-paper">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
        </>
      )}
    </div>
  );
}

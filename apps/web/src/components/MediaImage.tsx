import { cloudinarySrcSet, type ImageFit } from "../lib/cloudinary";

export function MediaImage({
  url,
  alt,
  fit = "full",
  className,
  draggable,
  fetchPriority,
}: {
  url: string;
  alt: string;
  fit?: ImageFit;
  className?: string;
  draggable?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const { src, srcSet, sizes } = cloudinarySrcSet(url, fit);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      draggable={draggable}
      fetchPriority={fetchPriority}
    />
  );
}

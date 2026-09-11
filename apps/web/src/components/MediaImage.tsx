import { cloudinarySrcSet, type ImageFit } from "../lib/cloudinary";

export function MediaImage({
  url,
  alt,
  fit = "full",
  className,
  draggable,
}: {
  url: string;
  alt: string;
  fit?: ImageFit;
  className?: string;
  draggable?: boolean;
}) {
  const { src, srcSet, sizes } = cloudinarySrcSet(url, fit);
  return <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} className={className} draggable={draggable} />;
}

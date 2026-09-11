export type ImageFit = "hero" | "full" | "twoThirds" | "half" | "thumb";

const WIDTHS: Record<ImageFit, number[]> = {
  hero: [480, 768, 1080, 1440, 1920],
  full: [480, 768, 1080, 1440, 1920],
  twoThirds: [480, 768, 1080, 1440],
  half: [400, 640, 800, 1080, 1280],
  thumb: [320, 640],
};

const SIZES: Record<ImageFit, string> = {
  hero: "100vw",
  full: "(max-width: 767px) calc(100vw - 3rem), calc(100vw - 8rem)",
  twoThirds: "(max-width: 1023px) calc(100vw - 3rem), calc(66vw - 4rem)",
  half: "(max-width: 767px) calc(100vw - 3rem), calc(50vw - 4rem)",
  thumb: "(max-width: 767px) 50vw, 360px",
};

function looksLikeTransform(segment: string): boolean {
  return /^(w_|h_|c_|q_|f_|dpr_|g_|e_|fl_)/.test(segment) || segment.includes(",");
}

export function cloudinaryUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return url;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => part === "upload" || part === "fetch");
    if (marker < 0) return url;
    const after = parts.slice(marker + 1);
    const rest = after[0] && looksLikeTransform(after[0]) ? after.slice(1) : after;
    parsed.pathname = `/${[...parts.slice(0, marker + 1), `w_${width},q_auto,f_auto`, ...rest].join("/")}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

export function cloudinarySrcSet(url: string, fit: ImageFit): { src: string; srcSet: string; sizes: string } {
  const widths = WIDTHS[fit];
  const fallback = widths[Math.min(2, widths.length - 1)] ?? 800;
  return {
    src: cloudinaryUrl(url, fallback),
    srcSet: widths.map((width) => `${cloudinaryUrl(url, width)} ${width}w`).join(", "),
    sizes: SIZES[fit],
  };
}

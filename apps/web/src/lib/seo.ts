export const SITE_NAME = "Dreamview Construction";
export const SITE_ORIGIN = "https://dreamviewconstructions.com";
export const SITE_DESCRIPTION =
  "Bengaluru construction studio. New buildings, interiors, and restoration — one team from the first walk of the plot through handover.";

export function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (!content) return;
  const selector = `meta[${attr}="${name}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

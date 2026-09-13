export const DEFAULT_HERO_COVER = "/cover.jpg";
export const DEFAULT_HERO_KICKER = "Construction practice";
export const DEFAULT_HERO_HEADING = "We build\n*great*\nbuildings.";
export const DEFAULT_HERO_BODY =
  "Structure first, then the rooms people inhabit. One team from the first walk of the plot to handover.";

export function resolveHeroCover(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed ? trimmed : DEFAULT_HERO_COVER;
}

export function heroHeadingLines(heading?: string | null): { text: string; accent: boolean }[] {
  const raw = heading?.trim() || DEFAULT_HERO_HEADING;
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const marked = line.match(/^\*(.+)\*$/);
      return { text: marked?.[1] ?? line, accent: Boolean(marked?.[1]) };
    });
  return lines.length ? lines : heroHeadingLines(DEFAULT_HERO_HEADING);
}

export const DEFAULT_HERO_COVER = "/cover.jpg";

export function resolveHeroCover(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed ? trimmed : DEFAULT_HERO_COVER;
}

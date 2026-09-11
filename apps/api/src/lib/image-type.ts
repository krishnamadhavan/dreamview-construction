export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

function ascii(buffer: Buffer, start: number, end: number): string {
  return buffer.toString("ascii", start, end);
}

function isAvif(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (ascii(buffer, 4, 8) !== "ftyp") return false;
  const brand = ascii(buffer, 8, 12);
  if (brand === "avif" || brand === "avis") return true;
  const boxSize = buffer.readUInt32BE(0);
  const end = Math.min(buffer.length, boxSize || 0);
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    const compatible = ascii(buffer, offset, offset + 4);
    if (compatible === "avif" || compatible === "avis") return true;
  }
  return false;
}

/** Detect type from file bytes. Filename and Content-Type are ignored. */
export function detectImageType(buffer: Buffer): AllowedImageType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP") {
    return "image/webp";
  }

  if (isAvif(buffer)) return "image/avif";

  return null;
}

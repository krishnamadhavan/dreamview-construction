const DEFAULT_MESSAGE = "Hello Dreamview — I have a site I'd like to discuss.";

export function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.startsWith("91") && digits.length >= 12) return digits;
  return digits;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function resolveWhatsAppNumber(whatsapp?: string | null, phone?: string | null): string {
  return whatsapp?.trim() || phone?.trim() || "";
}

export function whatsappHref(phone: string, message = DEFAULT_MESSAGE): string | null {
  const digits = phoneDigits(phone);
  if (digits.length < 11) return null;
  const url = new URL(`https://wa.me/${digits}`);
  url.searchParams.set("text", message);
  return url.toString();
}

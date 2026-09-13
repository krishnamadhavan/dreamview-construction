import { ArrowIcon } from "../components/ArrowIcon";
import { telHref, whatsappHref } from "../lib/whatsapp";
import { useSiteContent } from "./siteContent";

const FALLBACK_PHONE = "+91 80 0000 0000";

export function useStudioPhone() {
  return useSiteContent()?.settings.phone || FALLBACK_PHONE;
}

export function EnquireCta({
  className = "site-ask",
  label = "Enquire",
}: {
  className?: string;
  label?: string;
}) {
  const phone = useStudioPhone();
  const href = whatsappHref(phone) ?? "/#contact";
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
      <ArrowIcon />
    </a>
  );
}

export function EnquireFloat() {
  const phone = useStudioPhone();
  const href = whatsappHref(phone);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="site-ask-float">
      Enquire
      <ArrowIcon />
    </a>
  );
}

export function EnquireDirect() {
  const phone = useStudioPhone();
  const chat = whatsappHref(phone);
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {chat && (
        <a href={chat} target="_blank" rel="noreferrer" className="site-ask">
          WhatsApp
          <ArrowIcon />
        </a>
      )}
      <a href={telHref(phone)} className="site-ask-ghost">
        Call {phone}
      </a>
    </div>
  );
}

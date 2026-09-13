import { Link } from "react-router-dom";

const HEIGHT: Record<"sm" | "md" | "lg", string> = {
  sm: "h-14 sm:h-[4.5rem]",
  md: "h-20 sm:h-24",
  lg: "h-24 sm:h-28",
};

export function BrandMark({
  to,
  size = "sm",
  mark = false,
  className = "",
}: {
  to?: string;
  size?: "sm" | "md" | "lg";
  mark?: boolean;
  className?: string;
}) {
  const image = (
    <img
      src={mark ? "/logo-mark.png" : "/logo.png"}
      alt="Dreamview Construction"
      className={`brand-mark w-auto object-contain object-left ${HEIGHT[size]} ${className}`}
    />
  );

  if (!to) return image;

  return (
    <Link to={to} className="inline-flex shrink-0" aria-label="Dreamview Construction home">
      {image}
    </Link>
  );
}

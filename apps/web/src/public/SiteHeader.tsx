import { NavLink } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { EnquireCta } from "./EnquireCta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(28,28,28,0.55)] backdrop-blur-md">
      <div className="site-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <BrandMark to="/" size="sm" />
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] tracking-[0.18em] text-paper/80 uppercase">
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "text-paper" : "hover:text-paper")}>
            Work
          </NavLink>
          <a href="/#studio" className="hover:text-paper">
            Studio
          </a>
          <a href="/#process" className="hover:text-paper">
            Method
          </a>
          <EnquireCta />
        </nav>
      </div>
    </header>
  );
}

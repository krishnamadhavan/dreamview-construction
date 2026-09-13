import { Link, NavLink } from "react-router-dom";
import { ArrowIcon } from "../components/ArrowIcon";

export function SiteHeader({ onInk = false }: { onInk?: boolean }) {
  void onInk;
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(28,28,28,0.55)] backdrop-blur-md">
      <div className="site-shell flex items-center justify-between gap-6 py-4">
        <Link to="/" className="text-[13px] tracking-[0.4em] text-paper uppercase">
          Dreamview
        </Link>
        <nav className="flex items-center gap-7 text-[12px] tracking-[0.18em] text-paper/80 uppercase">
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "text-paper" : "hover:text-paper")}>
            Work
          </NavLink>
          <a href="/#studio" className="hover:text-paper">
            Studio
          </a>
          <a href="/#process" className="hover:text-paper">
            Method
          </a>
          <a href="/#contact" className="site-ask">
            Enquire
            <ArrowIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}

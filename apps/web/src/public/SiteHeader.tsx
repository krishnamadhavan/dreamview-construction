import { Link, NavLink } from "react-router-dom";

export function SiteHeader({ onInk = false }: { onInk?: boolean }) {
  const tone = onInk
    ? "text-paper [&_a]:text-paper/80 [&_a:hover]:text-paper [&_a.active]:text-paper"
    : "text-ink [&_a]:text-ink-soft [&_a:hover]:text-ink [&_a.active]:text-ink";

  return (
    <header className={`absolute inset-x-0 top-0 z-30 ${tone}`}>
      <div className="flex items-center justify-between px-6 py-6 md:px-10 lg:px-16">
        <Link to="/" className="!text-inherit">
          <p className="text-[11px] tracking-[0.32em] uppercase">Dreamview</p>
        </Link>
        <nav className="flex items-center gap-6 text-[11px] tracking-[0.2em] uppercase sm:gap-8 sm:text-[12px]">
          <a href="/#studio">Studio</a>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "active" : "")}>
            Projects
          </NavLink>
          <a href="/#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

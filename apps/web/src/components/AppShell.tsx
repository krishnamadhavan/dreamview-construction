import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

function Mark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
      <rect width="40" height="40" rx="4" fill="#1b1814" />
      <path d="M8 28V12h10.2c4.7 0 7.8 2.7 7.8 6.7 0 4.1-3.1 6.8-7.8 6.8H14.6V28H8Zm6.6-8.3h3.2c1.9 0 3.1-1 3.1-2.5s-1.2-2.4-3.1-2.4h-3.2v4.9Z" fill="#f3eee6" />
      <path d="M27 28V12h5v16h-5Z" fill="#b85c38" />
    </svg>
  );
}

export function AppShell() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex items-center justify-between border-b border-line bg-ink px-5 py-4 text-paper lg:flex-col lg:items-stretch lg:justify-start lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <p className="display text-lg leading-none">Dreamview</p>
            <p className="mt-1 text-[11px] tracking-[0.18em] text-sand uppercase">Admin</p>
          </div>
        </div>

        <nav className="hidden lg:mt-10 lg:block">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${isActive ? "bg-white/10 text-white" : "text-sand hover:bg-white/5"}`
            }
          >
            Projects
          </NavLink>
        </nav>

        <div className="lg:mt-auto">
          <p className="hidden text-xs text-sand/80 lg:mb-3 lg:block">{admin?.email}</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm text-sand underline-offset-4 hover:text-white hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12">
        <Outlet />
      </main>
    </div>
  );
}

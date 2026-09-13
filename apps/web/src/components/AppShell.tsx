import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { BrandMark } from "./BrandMark";

export function AppShell() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api
      .listEnquiries()
      .then((data) => setUnread(data.unread))
      .catch(() => setUnread(0));
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(28,28,28,0.55)] px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandMark to="/admin" size="sm" />
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">Admin</p>
          </div>
          <nav className="flex items-center gap-8 text-[12px] tracking-[0.18em] uppercase">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => (isActive ? "text-paper" : "text-paper/70 hover:text-paper")}
            >
              Work
            </NavLink>
            <NavLink
              to="/admin/enquiries"
              className={({ isActive }) => (isActive ? "text-paper" : "text-paper/70 hover:text-paper")}
            >
              Enquiries
              {unread > 0 && <span className="ml-2 text-gold">{String(unread).padStart(2, "0")}</span>}
            </NavLink>
            <NavLink
              to="/admin/site"
              className={({ isActive }) => (isActive ? "text-paper" : "text-paper/70 hover:text-paper")}
            >
              Site
            </NavLink>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-paper/70 hover:text-paper"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-5 py-10 sm:px-8">
        <p className="mb-8 hidden text-xs tracking-wide text-paper/40 sm:block">{admin?.email}</p>
        <Outlet />
      </main>
    </div>
  );
}

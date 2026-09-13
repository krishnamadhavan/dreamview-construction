import { useSiteContent } from "./siteContent";

export function SiteFooter() {
  const settings = useSiteContent()?.settings;
  const phone = settings?.phone || "+91 80 0000 0000";
  const email = settings?.email || "studio@dreamviewconstructions.com";
  const note = settings?.studioNote || "By appointment";
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="site-shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase">Dreamview</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-paper/50">
              Construction and site work. Quiet detailing, honest materials, buildings meant to last.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase">Index</p>
            <ul className="mt-3 space-y-2 text-sm text-paper/50">
              <li>
                <a href="/projects" className="hover:text-paper">
                  Work
                </a>
              </li>
              <li>
                <a href="/#studio" className="hover:text-paper">
                  Studio
                </a>
              </li>
              <li>
                <a href="/#process" className="hover:text-paper">
                  Method
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-paper">
                  Enquire
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase">Studio</p>
            <p className="mt-3 text-sm leading-6 text-paper/50">
              Drawing office and site.
              <br />
              {note}
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase">Contact</p>
            <p className="mt-3 text-sm leading-6 text-paper/50">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-paper">
                {phone}
              </a>
              <br />
              <a href={`mailto:${email}`} className="hover:text-paper">
                {email}
              </a>
            </p>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-5 text-[11px] tracking-[0.16em] text-paper/40 uppercase">
          © {new Date().getFullYear()} Dreamview
        </p>
      </div>
    </footer>
  );
}

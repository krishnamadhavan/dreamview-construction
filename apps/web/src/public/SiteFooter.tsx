export function SiteFooter() {
  return (
    <footer className="border-t border-line px-6 py-14 md:px-10 lg:px-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-[11px] tracking-[0.28em] text-ink uppercase">Dreamview</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Construction and site work. Quiet detailing, honest materials, buildings meant to last.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] text-ink uppercase">Index</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>
              <a href="/#studio" className="hover:text-ink">
                Studio
              </a>
            </li>
            <li>
              <a href="/projects" className="hover:text-ink">
                Projects
              </a>
            </li>
            <li>
              <a href="/#contact" className="hover:text-ink">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.22em] text-ink uppercase">Studio</p>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Drawing office and site.
            <br />
            Enquiries by appointment.
          </p>
        </div>
      </div>
      <p className="mt-12 text-xs tracking-wide text-ink-soft">© {new Date().getFullYear()} Dreamview</p>
    </footer>
  );
}

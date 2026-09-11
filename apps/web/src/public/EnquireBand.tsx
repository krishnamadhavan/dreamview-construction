import { Link } from "react-router-dom";

export function EnquireBand() {
  return (
    <section id="contact" className="scroll-mt-8 bg-ink px-6 py-24 text-paper md:px-10 md:py-32 lg:px-16">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-[11px] tracking-[0.28em] text-sand uppercase">Enquire</p>
          <h2 className="display mt-4 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
            Tell us about the site.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-sand">
            A plot, a conversion, a building that needs to be taken apart and put back properly —
            write with the brief as you have it. We will tell you if we are the right contractor.
          </p>
        </div>
        <div className="space-y-8 border-t border-white/15 pt-8 lg:border-t-0 lg:pt-0">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-sand uppercase">Studio</p>
            <p className="mt-2 text-sm leading-6 text-paper/80">
              Drawing office and site visits
              <br />
              By appointment
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex text-[12px] tracking-[0.22em] uppercase underline-offset-8 hover:underline"
          >
            Review the work
          </Link>
        </div>
      </div>
    </section>
  );
}

import { EnquireForm } from "./HomeExtras";
import { useSiteContent } from "./siteContent";

export function EnquireBand() {
  const settings = useSiteContent()?.settings;
  const heading = settings?.enquireHeading || "Tell us about the site.";
  const body =
    settings?.enquireBody ||
    "A plot, a conversion, a building that needs to be taken apart and put back properly — write with the brief as you have it.";
  const phone = settings?.phone || "+91 80 0000 0000";
  const email = settings?.email || "studio@dreamviewconstructions.com";
  const note = settings?.studioNote || "By appointment";

  return (
    <section id="contact" className="scroll-mt-24 border-t border-white/10 py-28">
      <div className="site-shell grid gap-14 lg:grid-cols-2 lg:items-start">
        <div className="site-in">
          <p className="site-kicker">Enquire</p>
          <h2 className="display mt-4 max-w-3xl text-5xl leading-[0.95] md:text-6xl">{heading}</h2>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-paper/60">{body}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="site-kicker">Studio</p>
              <p className="mt-2 text-sm text-paper/70">{note}</p>
            </div>
            <div>
              <p className="site-kicker">Phone</p>
              <p className="mt-2 text-sm text-paper/70">
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </p>
            </div>
            <div>
              <p className="site-kicker">Mail</p>
              <p className="mt-2 text-sm text-paper/70">
                <a href={`mailto:${email}`}>{email}</a>
              </p>
            </div>
          </div>
        </div>
        <div className="site-in" style={{ ["--d" as string]: "120ms" }}>
          <EnquireForm />
        </div>
      </div>
    </section>
  );
}

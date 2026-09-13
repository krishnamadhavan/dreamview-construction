import { type FormEvent, useState } from "react";
import { api } from "../api";
import { MediaImage } from "../components/MediaImage";
import { entriesOf, useSiteContent, useSiteReady } from "./siteContent";

const PEOPLE = [
  { initials: "KM", name: "Krishna", role: "Principal" },
  { initials: "ST", name: "Site lead", role: "Superintendent" },
  { initials: "DR", name: "Drawings", role: "Studio" },
];

const VOICES = [
  { quote: "One team, one story, no competing drawings.", cite: "Client · residence" },
  { quote: "They stayed on site after the plan was signed.", cite: "Architect · restoration" },
];

const AWARDS = [
  { title: "Master Builders mention", meta: "2024 · Residence" },
  { title: "Published restoration", meta: "2023 · Journal" },
  { title: "Civic works shortlist", meta: "2022 · City" },
];

const NOTES = [
  {
    kicker: "June 2026 · Process",
    title: "A wall that will age well",
    excerpt: "Lime, not paint, where the sun hits the west face. The first year is the test.",
  },
  {
    kicker: "March 2026 · Material",
    title: "Joints that stay quiet",
    excerpt: "Stone to timber without a cover strip. The detail is the meeting, not the object.",
  },
];

const FAQS = [
  {
    q: "Do you take small jobs?",
    a: "Yes, if the work is considered — a single room, a stair, a wall that has to last. We do not take volume fit-outs.",
  },
  {
    q: "Do we need an architect first?",
    a: "Not always. We can start from a brief and bring a drawing set, or work under an architect you already have.",
  },
  {
    q: "How long to a first visit?",
    a: "Usually within two weeks of a clear note about the site. We will say if we are not the right contractor.",
  },
  {
    q: "Where do you work?",
    a: "Bengaluru first. Farther jobs by appointment when the brief is right.",
  },
];

export function HomeExtras({ noteImages = [] }: { noteImages?: string[] }) {
  const site = useSiteContent();
  const loaded = useSiteReady();
  const people = entriesOf(site, "person");
  const voices = entriesOf(site, "voice");
  const awards = entriesOf(site, "award");
  const notes = entriesOf(site, "journal");
  const faqs = entriesOf(site, "faq");
  const clients = entriesOf(site, "client");
  const peopleView = people.length
    ? people.map((e) => ({ initials: e.body || e.title.slice(0, 2), name: e.title, role: e.subtitle }))
    : loaded
      ? []
      : PEOPLE;
  const voicesView = voices.length ? voices.map((e) => ({ quote: e.title, cite: e.subtitle })) : loaded ? [] : VOICES;
  const awardsView = awards.length ? awards.map((e) => ({ title: e.title, meta: e.subtitle })) : loaded ? [] : AWARDS;
  const notesView = notes.length
    ? notes.map((e, i) => ({ kicker: e.subtitle, title: e.title, excerpt: e.body, image: e.imageUrl || noteImages[i] }))
    : loaded
      ? []
      : NOTES.map((note, i) => ({ ...note, image: noteImages[i] }));
  const faqsView = faqs.length ? faqs.map((e) => ({ q: e.title, a: e.body })) : loaded ? [] : FAQS;
  const clientsView = clients.length ? clients.map((e) => e.title) : loaded ? [] : ["Private residences", "Architects", "Civic works", "Restorations"];
  const territoryHeading = site?.settings.territoryHeading || "Where we work";
  const territoryBody =
    site?.settings.territoryBody ||
    "Bengaluru and the plots we can reach in a morning — Mysore road, the east, and jobs we take on by appointment farther out.";

  return (
    <>
      {peopleView.length > 0 && (
      <section id="people" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">People</p>
            <h2 className="display mt-3 text-5xl">The studio</h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {peopleView.map((person, index) => (
              <li key={person.initials} className="site-in border border-white/10 px-6 py-8" style={{ ["--d" as string]: `${index * 100}ms` }}>
                <p className="display flex h-14 w-14 items-center justify-center border border-white/10 text-xl text-gold">
                  {person.initials}
                </p>
                <h3 className="display mt-6 text-2xl">{person.name}</h3>
                <p className="mt-1 text-[11px] tracking-[0.18em] text-paper/40 uppercase">{person.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}

      {voicesView.length > 0 && (
      <section id="voices" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Voices</p>
            <h2 className="display mt-3 text-5xl">After the keys</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {voicesView.map((voice, index) => (
              <blockquote key={voice.cite} className="site-in border border-white/10 bg-[#111] px-7 py-8" style={{ ["--d" as string]: `${index * 120}ms` }}>
                <p className="display text-2xl leading-snug italic">“{voice.quote}”</p>
                <cite className="mt-6 block text-[11px] tracking-[0.18em] text-gold not-italic uppercase">{voice.cite}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      )}

      {awardsView.length > 0 && (
      <section id="recognition" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Recognition</p>
            <h2 className="display mt-3 text-5xl">On the record</h2>
          </div>
          <ul className="mt-12">
            {awardsView.map((award, index) => (
              <li key={award.title} className="site-in flex flex-wrap items-baseline justify-between gap-3 border-t border-white/10 py-5 last:border-b" style={{ ["--d" as string]: `${index * 80}ms` }}>
                <p className="display text-2xl">{award.title}</p>
                <p className="text-[11px] tracking-[0.16em] text-paper/40 uppercase">{award.meta}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}

      {(territoryHeading || territoryBody) && (
      <section id="territory" className="scroll-mt-24 py-28">
        <div className="site-shell grid gap-10 lg:grid-cols-2 lg:items-end">
          <div className="site-in">
            <p className="site-kicker">Territory</p>
            <h2 className="display mt-3 text-5xl">{territoryHeading}</h2>
          </div>
          <p className="site-in max-w-xl text-[15px] leading-7 text-paper/60" style={{ ["--d" as string]: "100ms" }}>
            {territoryBody}
          </p>
        </div>
      </section>
      )}

      {notesView.length > 0 && (
      <section id="journal" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Journal</p>
            <h2 className="display mt-3 text-5xl">Notes from site</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {notesView.map((note, index) => (
              <article key={note.title} className="site-in" style={{ ["--d" as string]: `${index * 120}ms` }}>
                <div className="site-mask overflow-hidden bg-[#161616]">
                  {note.image ? (
                    <MediaImage url={note.image} alt="" fit="half" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/3] bg-[#161616]" />
                  )}
                </div>
                <p className="site-kicker mt-4">{note.kicker}</p>
                <h3 className="display mt-2 text-3xl">{note.title}</h3>
                <p className="mt-3 text-sm leading-6 text-paper/50">{note.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {clientsView.length > 0 && (
      <section id="clients" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Clients</p>
            <h2 className="display mt-3 text-5xl">Who we build with</h2>
          </div>
          <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {clientsView.map((item, index) => (
              <p key={item} className="site-in display text-2xl text-paper/70" style={{ ["--d" as string]: `${index * 70}ms` }}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
      )}

      {faqsView.length > 0 && (
      <section id="questions" className="scroll-mt-24 py-28">
        <div className="site-shell">
          <div className="site-in">
            <p className="site-kicker">Questions</p>
            <h2 className="display mt-3 text-5xl">Before you write</h2>
          </div>
          <div className="mt-12">
            {faqsView.map((item, index) => (
              <details key={item.q} className="site-in group border-t border-white/10 last:border-b" style={{ ["--d" as string]: `${index * 60}ms` }}>
                <summary className="display flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-2xl">
                  {item.q}
                  <span className="text-gold group-open:hidden">+</span>
                  <span className="hidden text-gold group-open:inline">–</span>
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-6 text-paper/50">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      )}
    </>
  );
}

export function EnquireForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(null);
    try {
      await api.sendEnquiry({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        site: String(data.get("site") ?? ""),
        brief: String(data.get("brief") ?? ""),
        company: String(data.get("company") ?? ""),
      });
      form.reset();
      setSent(true);
    } catch (err) {
      setSent(false);
      setError(err instanceof Error ? err.message : "Could not send the brief");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-6">
      <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="block text-[11px] tracking-[0.18em] text-paper/50 uppercase">
        Name
        <input
          name="name"
          required
          placeholder="Your name"
          className="mt-2 w-full border-0 border-b border-white/20 bg-transparent py-3 text-sm tracking-normal text-paper outline-none placeholder:text-paper/30 focus:border-gold"
        />
      </label>
      <label className="block text-[11px] tracking-[0.18em] text-paper/50 uppercase">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="you@studio.com"
          className="mt-2 w-full border-0 border-b border-white/20 bg-transparent py-3 text-sm tracking-normal text-paper outline-none placeholder:text-paper/30 focus:border-gold"
        />
      </label>
      <label className="block text-[11px] tracking-[0.18em] text-paper/50 uppercase">
        Phone
        <input
          name="phone"
          type="tel"
          placeholder="Optional"
          className="mt-2 w-full border-0 border-b border-white/20 bg-transparent py-3 text-sm tracking-normal text-paper outline-none placeholder:text-paper/30 focus:border-gold"
        />
      </label>
      <label className="block text-[11px] tracking-[0.18em] text-paper/50 uppercase">
        Site
        <input
          name="site"
          required
          placeholder="City, plot, or existing building"
          className="mt-2 w-full border-0 border-b border-white/20 bg-transparent py-3 text-sm tracking-normal text-paper outline-none placeholder:text-paper/30 focus:border-gold"
        />
      </label>
      <label className="block text-[11px] tracking-[0.18em] text-paper/50 uppercase">
        Brief
        <textarea
          name="brief"
          required
          rows={4}
          placeholder="What must the building do?"
          className="mt-2 w-full resize-y border-0 border-b border-white/20 bg-transparent py-3 text-sm tracking-normal text-paper outline-none placeholder:text-paper/30 focus:border-gold"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center gap-3 rounded-full bg-gold px-5 py-3 text-[12px] tracking-[0.16em] text-void uppercase transition hover:-translate-y-0.5 hover:bg-[#d8bc86] disabled:opacity-55"
      >
        {busy ? "Sending…" : "Send the brief"}
        <svg viewBox="0 0 18 10" className="h-2.5 w-4" aria-hidden="true">
          <path
            d="M1 5h14M11 1.5 16 5l-5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {error && <p className="text-sm text-gold">{error}</p>}
      {sent && !error && (
        <p className="text-sm text-gold">Received — we will write back if we are the right contractor.</p>
      )}
    </form>
  );
}

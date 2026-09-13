import { type FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import { ArrowIcon } from "../components/ArrowIcon";
import { HeroCoverDropper } from "../components/HeroCoverDropper";
import { useToast } from "../toast";
import type { SiteContent, SiteEntry, SiteEntryKind, SiteSettings } from "../types";

const KINDS: { kind: SiteEntryKind; label: string; hint: string }[] = [
  { kind: "service", label: "Capabilities", hint: "Title and a short description" },
  { kind: "step", label: "Method", hint: "The steps a job runs through" },
  { kind: "person", label: "People", hint: "Name, role, initials" },
  { kind: "voice", label: "Voices", hint: "Quote and attribution" },
  { kind: "award", label: "Recognition", hint: "Title and year" },
  { kind: "journal", label: "Journal", hint: "Title, kicker, note, optional image URL" },
  { kind: "client", label: "Clients", hint: "A short label" },
  { kind: "faq", label: "Questions", hint: "Question and answer" },
];

function emptyEntry(kind: SiteEntryKind, sortOrder: number): SiteEntry {
  return {
    id: crypto.randomUUID(),
    kind,
    title: "",
    subtitle: "",
    body: "",
    imageUrl: "",
    sortOrder,
  };
}

function fieldsFor(kind: SiteEntryKind) {
  if (kind === "person") return { title: "Name", subtitle: "Role", body: "Initials" };
  if (kind === "voice") return { title: "Quote", subtitle: "Attribution", body: null };
  if (kind === "award") return { title: "Title", subtitle: "Year / note", body: null };
  if (kind === "journal") return { title: "Title", subtitle: "Kicker", body: "Excerpt" };
  if (kind === "faq") return { title: "Question", subtitle: null, body: "Answer" };
  if (kind === "service") return { title: "Title", subtitle: null, body: "Description" };
  if (kind === "step") return { title: "Title", subtitle: null, body: "Description" };
  return { title: "Label", subtitle: null, body: null };
}

export function SitePage() {
  const toast = useToast();
  const [site, setSite] = useState<SiteContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getSite()
      .then((data) => {
        setSite(data.site);
        setLoadError(null);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Could not load site"));
  }, []);

  function patchSettings(patch: Partial<SiteSettings>) {
    setSite((current) => (current ? { ...current, settings: { ...current.settings, ...patch } } : current));
  }

  function patchEntry(id: string, patch: Partial<SiteEntry>) {
    setSite((current) =>
      current
        ? { ...current, entries: current.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) }
        : current,
    );
  }

  function addEntry(kind: SiteEntryKind) {
    setSite((current) => {
      if (!current) return current;
      const count = current.entries.filter((entry) => entry.kind === kind).length;
      return { ...current, entries: [...current.entries, emptyEntry(kind, count)] };
    });
  }

  function removeEntry(id: string) {
    setSite((current) => (current ? { ...current, entries: current.entries.filter((entry) => entry.id !== id) } : current));
  }

  function moveEntry(id: string, direction: -1 | 1) {
    setSite((current) => {
      if (!current) return current;
      const entry = current.entries.find((item) => item.id === id);
      if (!entry) return current;
      const same = current.entries.filter((item) => item.kind === entry.kind);
      const others = current.entries.filter((item) => item.kind !== entry.kind);
      const index = same.findIndex((item) => item.id === id);
      const next = index + direction;
      if (next < 0 || next >= same.length) return current;
      const reordered = [...same];
      const [moved] = reordered.splice(index, 1);
      if (!moved) return current;
      reordered.splice(next, 0, moved);
      return { ...current, entries: [...others, ...reordered] };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!site) return;
    setSaving(true);
    try {
      const entries = KINDS.flatMap(({ kind }) =>
        site.entries
          .filter((entry) => entry.kind === kind && entry.title.trim())
          .map((entry, index) => ({ ...entry, sortOrder: index })),
      );
      const { site: saved } = await api.saveSite({ settings: site.settings, entries });
      setSite(saved);
      toast.push("Site content saved");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save site", "err");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-paper/70">{loadError}</p>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!site) return <p className="text-sm text-paper/50">Loading…</p>;

  const { settings } = site;

  return (
    <form onSubmit={onSubmit} className="space-y-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Public site</p>
          <h1 className="display mt-1 text-5xl">Sections</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-paper/50">
            Hero cover, studio copy, method, people, and enquire. Work still comes from projects.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
            View site
          </a>
          <button type="submit" disabled={saving} className="admin-btn">
            {saving ? "Saving…" : "Save site"}
            <ArrowIcon />
          </button>
        </div>
      </div>

      <HeroCoverDropper
        url={settings.heroImageUrl || ""}
        onChange={(next) =>
          setSite((current) =>
            current
              ? { ...current, settings: { ...current.settings, heroImageUrl: next.settings.heroImageUrl } }
              : next,
          )
        }
      />

      <section className="space-y-5">
        <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Studio</p>
        <label className="block text-sm">
          Heading
          <input className="admin-field" value={settings.studioHeading} onChange={(e) => patchSettings({ studioHeading: e.target.value })} />
        </label>
        <label className="block text-sm">
          Copy
          <textarea className="admin-field" rows={6} value={settings.studioBody} onChange={(e) => patchSettings({ studioBody: e.target.value })} />
        </label>
        <label className="block text-sm">
          Territory heading
          <input className="admin-field" value={settings.territoryHeading} onChange={(e) => patchSettings({ territoryHeading: e.target.value })} />
        </label>
        <label className="block text-sm">
          Territory copy
          <textarea className="admin-field" rows={3} value={settings.territoryBody} onChange={(e) => patchSettings({ territoryBody: e.target.value })} />
        </label>
      </section>

      <section className="space-y-5">
        <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Enquire</p>
        <label className="block text-sm">
          Heading
          <input className="admin-field" value={settings.enquireHeading} onChange={(e) => patchSettings({ enquireHeading: e.target.value })} />
        </label>
        <label className="block text-sm">
          Copy
          <textarea className="admin-field" rows={3} value={settings.enquireBody} onChange={(e) => patchSettings({ enquireBody: e.target.value })} />
        </label>
        <div className="grid gap-5 md:grid-cols-3">
          <label className="block text-sm">
            Phone / WhatsApp
            <input className="admin-field" value={settings.phone} onChange={(e) => patchSettings({ phone: e.target.value })} />
            <span className="mt-2 block text-xs text-paper/40">Used for Call and the Enquire WhatsApp button.</span>
          </label>
          <label className="block text-sm">
            Email
            <input className="admin-field" value={settings.email} onChange={(e) => patchSettings({ email: e.target.value })} />
          </label>
          <label className="block text-sm">
            Studio note
            <input className="admin-field" value={settings.studioNote} onChange={(e) => patchSettings({ studioNote: e.target.value })} />
          </label>
        </div>
      </section>

      {KINDS.map(({ kind, label, hint }) => {
        const rows = site.entries.filter((entry) => entry.kind === kind);
        const labels = fieldsFor(kind);
        return (
          <section key={kind} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.28em] text-gold uppercase">{label}</p>
                <p className="mt-1 text-sm text-paper/40">{hint}</p>
              </div>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => addEntry(kind)}>
                Add
              </button>
            </div>
            {rows.length === 0 && <p className="text-sm text-paper/40">None yet.</p>}
            <ul className="space-y-4">
              {rows.map((entry, index) => (
                <li key={entry.id} className="space-y-3 border border-white/10 bg-[#111] p-4">
                  <label className="block text-sm">
                    {labels.title}
                    <input className="admin-field" value={entry.title} onChange={(e) => patchEntry(entry.id, { title: e.target.value })} />
                  </label>
                  {labels.subtitle && (
                    <label className="block text-sm">
                      {labels.subtitle}
                      <input className="admin-field" value={entry.subtitle} onChange={(e) => patchEntry(entry.id, { subtitle: e.target.value })} />
                    </label>
                  )}
                  {labels.body && (
                    <label className="block text-sm">
                      {labels.body}
                      <textarea
                        className="admin-field"
                        rows={kind === "faq" || kind === "journal" || kind === "service" || kind === "step" ? 4 : 2}
                        value={entry.body}
                        onChange={(e) => patchEntry(entry.id, { body: e.target.value })}
                      />
                    </label>
                  )}
                  {kind === "journal" && (
                    <label className="block text-sm">
                      Image URL
                      <input className="admin-field" value={entry.imageUrl} onChange={(e) => patchEntry(entry.id, { imageUrl: e.target.value })} />
                    </label>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <button type="button" className="text-gold/80 hover:text-gold disabled:text-paper/25" disabled={index === 0} onClick={() => moveEntry(entry.id, -1)}>
                      Up
                    </button>
                    <button
                      type="button"
                      className="text-gold/80 hover:text-gold disabled:text-paper/25"
                      disabled={index === rows.length - 1}
                      onClick={() => moveEntry(entry.id, 1)}
                    >
                      Down
                    </button>
                    <button type="button" className="text-gold/80 hover:text-gold" onClick={() => removeEntry(entry.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <button type="submit" disabled={saving} className="admin-btn">
        {saving ? "Saving…" : "Save site"}
        <ArrowIcon />
      </button>
    </form>
  );
}

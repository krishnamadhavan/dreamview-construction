import { useEffect, useState } from "react";
import { api } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatSchedule } from "../lib/datetime";
import { useToast } from "../toast";
import type { Enquiry } from "../types";

export function EnquiriesPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const data = await api.listEnquiries();
    setRows(data.enquiries);
  }

  useEffect(() => {
    load().catch((error) => {
      toast.push(error instanceof Error ? error.message : "Could not load enquiries", "err");
      setRows([]);
    });
  }, [toast]);

  async function toggle(row: Enquiry) {
    setOpenId((current) => (current === row.id ? null : row.id));
    if (row.readAt) return;
    try {
      const { enquiry } = await api.markEnquiryRead(row.id);
      setRows((current) => current?.map((item) => (item.id === enquiry.id ? enquiry : item)) ?? null);
    } catch {
      // list still shows the brief; badge can refresh on next load
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteEnquiry(pendingDelete.id);
      setRows((current) => current?.filter((item) => item.id !== pendingDelete.id) ?? null);
      setPendingDelete(null);
      toast.push("Enquiry removed");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not remove enquiry", "err");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-[11px] tracking-[0.3em] text-gold uppercase">Inbox</p>
        <h1 className="display mt-1 text-5xl">Enquiries</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-paper/50">
          Briefs sent from the public enquire form. Open one to mark it read.
        </p>
      </div>

      {rows === null && <p className="mt-10 text-sm text-paper/50">Loading…</p>}

      {rows && rows.length === 0 && (
        <div className="mt-10 border border-dashed border-white/15 px-8 py-16 text-center">
          <p className="display text-3xl">No briefs yet</p>
          <p className="mt-3 text-sm text-paper/50">Public enquiries will land here.</p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <ul className="mt-10 space-y-3">
          {rows.map((row) => {
            const expanded = openId === row.id;
            return (
              <li key={row.id} className="border border-white/10 bg-[#111]">
                <button
                  type="button"
                  onClick={() => void toggle(row)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <p className="display text-2xl">{row.name}</p>
                    <p className="mt-1 text-sm text-paper/50">
                      {row.site}
                      {row.email ? ` · ${row.email}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {!row.readAt && (
                      <p className="text-[10px] tracking-[0.18em] text-gold uppercase">New</p>
                    )}
                    <p className="mt-1 text-[11px] tracking-wide text-paper/40 uppercase">
                      {formatSchedule(row.createdAt)}
                    </p>
                  </div>
                </button>
                {expanded && (
                  <div className="space-y-4 border-t border-white/10 px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-paper/70">{row.brief}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a className="text-gold/80 hover:text-gold" href={`mailto:${row.email}`}>
                        Reply by mail
                      </a>
                      {row.phone && (
                        <a className="text-gold/80 hover:text-gold" href={`tel:${row.phone.replace(/\s/g, "")}`}>
                          {row.phone}
                        </a>
                      )}
                      <button type="button" className="text-gold/80 hover:text-gold" onClick={() => setPendingDelete(row)}>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove this brief?"
          body="It will be deleted from the inbox. This cannot be undone."
          confirmLabel="Remove"
          busy={deleting}
          onClose={() => {
            if (deleting) return;
            setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  );
}

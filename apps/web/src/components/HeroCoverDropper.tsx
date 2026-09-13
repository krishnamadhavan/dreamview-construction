import { useRef, useState } from "react";
import { api } from "../api";
import { resolveHeroCover } from "../lib/hero";
import { MediaImage } from "./MediaImage";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "../toast";
import type { SiteContent } from "../types";

export function HeroCoverDropper({
  url,
  onChange,
}: {
  url: string;
  onChange: (site: SiteContent) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function upload(fileList: FileList | File[]) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    const file = Array.from(fileList).find((item) => allowed.has(item.type));
    if (!file) {
      toast.push("Choose a JPEG, PNG, WebP, or AVIF file", "err");
      return;
    }
    const local = URL.createObjectURL(file);
    setPreview(local);
    setUploading(true);
    try {
      const { site } = await api.uploadSiteHero(file);
      onChange(site);
      toast.push("Hero cover uploaded");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Upload failed", "err");
    } finally {
      URL.revokeObjectURL(local);
      setPreview(null);
      setUploading(false);
    }
  }

  async function remove() {
    setRemoving(true);
    try {
      const { site } = await api.deleteSiteHero();
      onChange(site);
      setConfirmRemove(false);
      toast.push("Hero cover removed");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not remove cover", "err");
    } finally {
      setRemoving(false);
    }
  }

  const custom = Boolean(url.trim());
  const shown = preview || resolveHeroCover(url);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Hero</p>
        <p className="mt-1 text-sm text-paper/40">First slide of the homepage carousel. Project covers follow it.</p>
      </div>

      <div
        className={`overflow-hidden border bg-[#111] ${dragOver ? "border-gold" : "border-white/10"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
        }}
      >
        <button type="button" onClick={() => inputRef.current?.click()} className="relative block aspect-[16/8] w-full bg-[#161616]">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <MediaImage url={shown} alt="Hero cover" fit="hero" className="h-full w-full object-cover" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-gold px-2 py-0.5 text-[10px] tracking-wide text-void uppercase">
            {custom ? "Cover" : "Default"}
          </span>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-void/50 text-sm tracking-[0.16em] text-paper uppercase">
              Uploading…
            </div>
          )}
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm text-paper/50">
            {custom ? "This image leads the hero carousel." : "Using local cover.jpg until you drop a replacement."}
          </p>
          <div className="flex gap-4 text-sm">
            <button type="button" className="text-gold/80 hover:text-gold" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {custom ? "Replace" : "Upload"}
            </button>
            {custom && (
              <button type="button" className="text-gold/80 hover:text-gold" disabled={uploading || removing} onClick={() => setConfirmRemove(true)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void upload(event.target.files);
          event.target.value = "";
        }}
      />

      {confirmRemove && (
        <ConfirmDialog
          title="Remove the hero cover?"
          body="The first carousel slide will use the local cover.jpg again."
          confirmLabel="Remove cover"
          busy={removing}
          onClose={() => {
            if (removing) return;
            setConfirmRemove(false);
          }}
          onConfirm={() => void remove()}
        />
      )}
    </section>
  );
}

import { useRef, useState } from "react";
import { api } from "../api";
import { MediaImage } from "./MediaImage";
import { useToast } from "../toast";

export function JournalImageDropper({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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
      const { url: next } = await api.uploadSiteImage(file);
      onChange(next);
      toast.push("Journal image uploaded");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Upload failed", "err");
    } finally {
      URL.revokeObjectURL(local);
      setPreview(null);
      setUploading(false);
    }
  }

  const shown = preview || url;

  return (
    <div className="space-y-2">
      <p className="text-sm">Image</p>
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
        {shown ? (
          <button type="button" onClick={() => inputRef.current?.click()} className="relative block aspect-[16/9] w-full bg-[#161616]">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <MediaImage url={url} alt="" fit="half" className="h-full w-full object-cover" />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-void/50 text-sm tracking-[0.16em] text-paper uppercase">
                Uploading…
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center px-4 py-10 text-center text-sm text-paper/50"
          >
            {uploading ? "Uploading…" : "Drop an image here or click to browse"}
          </button>
        )}
        <div className="flex flex-wrap gap-4 px-4 py-3 text-sm">
          <button type="button" className="text-gold/80 hover:text-gold" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {url ? "Replace" : "Upload"}
          </button>
          {url && (
            <button type="button" className="text-gold/80 hover:text-gold" disabled={uploading} onClick={() => onChange("")}>
              Remove
            </button>
          )}
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
    </div>
  );
}

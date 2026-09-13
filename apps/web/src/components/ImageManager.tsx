import { useRef, useState } from "react";
import { api } from "../api";
import { MediaImage } from "./MediaImage";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "../toast";
import type { ProjectImage } from "../types";

export function ImageManager({
  projectId,
  images,
  onChange,
}: {
  projectId: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<ProjectImage | null>(null);
  const [removing, setRemoving] = useState(false);
  const removingLock = useRef(false);

  async function upload(fileList: FileList | File[]) {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    const files = Array.from(fileList).filter((file) => allowed.has(file.type));
    if (files.length === 0) {
      toast.push("Choose JPEG, PNG, WebP, or AVIF files", "err");
      return;
    }
    setUploading(true);
    try {
      const { images: added } = await api.uploadImages(projectId, files);
      onChange([...images, ...added]);
      toast.push(added.length === 1 ? "Image uploaded" : `${added.length} images uploaded`);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Upload failed", "err");
    } finally {
      setUploading(false);
    }
  }

  async function confirmRemove() {
    if (!pendingRemove || removingLock.current) return;
    removingLock.current = true;
    setRemoving(true);
    const image = pendingRemove;
    try {
      await api.deleteImage(projectId, image.id);
      onChange(images.filter((item) => item.id !== image.id));
      setPendingRemove(null);
      toast.push("Image removed");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not remove image", "err");
    } finally {
      removingLock.current = false;
      setRemoving(false);
    }
  }

  async function saveAlt(image: ProjectImage, alt: string) {
    if (alt === image.alt) return;
    try {
      const { image: updated } = await api.updateImage(projectId, image.id, alt);
      onChange(images.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save alt text", "err");
    }
  }

  async function persistOrder(next: ProjectImage[]) {
    onChange(next);
    try {
      const { images: saved } = await api.reorderImages(
        projectId,
        next.map((image) => image.id),
      );
      onChange(saved);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not reorder images", "err");
    }
  }

  function onDropImage(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = images.findIndex((image) => image.id === dragId);
    const to = images.findIndex((image) => image.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    void persistOrder(next);
    setDragId(null);
  }

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="display text-2xl">Images</h2>
          <p className="mt-1 text-sm text-paper/50">
            Stored on Cloudinary. First image is the cover. Drag to reorder.
          </p>
        </div>
        <span className="text-xs tracking-wide text-paper/40 uppercase">{images.length} / 24</span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
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
        className={`mt-5 flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition ${
          dragOver ? "border-gold bg-gold/10" : "border-white/15 bg-[#161616] hover:border-gold/50"
        }`}
      >
        <p className="text-sm font-medium">{uploading ? "Uploading…" : "Drop images here or click to browse"}</p>
        <p className="mt-1 text-xs text-paper/40">JPEG, PNG, WebP, AVIF · up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) void upload(event.target.files);
            event.target.value = "";
          }}
        />
      </button>

      {images.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => setDragId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDropImage(image.id)}
              className="overflow-hidden border border-white/10 bg-[#111]"
            >
              <div className="relative aspect-[4/3] bg-[#161616]">
                <MediaImage
                  url={image.url}
                  alt={image.alt || image.storageKey}
                  fit="thumb"
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-3 left-3 rounded-full bg-gold px-2 py-0.5 text-[10px] tracking-wide text-void uppercase">
                    Cover
                  </span>
                )}
              </div>
              <div className="space-y-3 p-3">
                <input
                  defaultValue={image.alt}
                  placeholder="Alt text"
                  className="admin-field !mt-0 text-sm"
                  onBlur={(event) => void saveAlt(image, event.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-paper/40">{Math.round(image.sizeBytes / 1024)} KB</span>
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => {
                      if (removingLock.current) return;
                      setPendingRemove(image);
                    }}
                    className="text-xs text-gold/80 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removing && pendingRemove?.id === image.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingRemove && (
        <ConfirmDialog
          title="Remove this image?"
          body="It will be deleted from Cloudinary and this project. This cannot be undone."
          confirmLabel="Remove image"
          busy={removing}
          onClose={() => {
            if (removingLock.current) return;
            setPendingRemove(null);
          }}
          onConfirm={() => void confirmRemove()}
        />
      )}
    </section>
  );
}

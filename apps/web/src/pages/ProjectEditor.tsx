import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ImageManager } from "../components/ImageManager";
import { fromDatetimeLocal, localTimeZone, toDatetimeLocal } from "../lib/datetime";
import { useToast } from "../toast";
import type { Project, ProjectImage, ProjectStatus } from "../types";

export function ProjectEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("draft");
  const [publishLocal, setPublishLocal] = useState("");
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(isNew ? null : id);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    api
      .getProject(id)
      .then(({ project }) => applyProject(project))
      .catch((error) => {
        toast.push(error instanceof Error ? error.message : "Project not found", "err");
        navigate("/admin");
      })
      .finally(() => setLoaded(true));
  }, [id, isNew, navigate, toast]);

  function applyProject(project: Project) {
    setProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status);
    setPublishLocal(toDatetimeLocal(project.publishAt));
    setImages(project.images);
    setSlug(project.slug);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (!projectId) {
        const { project } = await api.createProject({
          title,
          description,
          status,
          publishAt: status === "scheduled" ? fromDatetimeLocal(publishLocal) : status === "published" ? new Date().toISOString() : null,
        });
        applyProject(project);
        toast.push("Project created");
        navigate(`/admin/projects/${project.id}`, { replace: true });
      } else {
        const { project } = await api.updateProject(projectId, {
          title,
          description,
          status,
          publishAt: status === "scheduled" ? fromDatetimeLocal(publishLocal) : status === "draft" ? null : undefined,
        });
        applyProject({ ...project, images });
        toast.push("Project saved");
      }
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save project", "err");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!projectId) return;
    setDeleting(true);
    try {
      await api.deleteProject(projectId);
      toast.push("Project deleted");
      navigate("/admin");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not delete project", "err");
      setDeleting(false);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-ink-soft">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin" className="text-sm text-ink-soft hover:text-ink">
        ← Projects
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-ink-soft uppercase">
            {isNew ? "New" : "Edit"}
          </p>
          <h1 className="display mt-1 text-4xl">{title || "Untitled project"}</h1>
          {slug && <p className="mt-2 font-mono text-xs text-ink-soft">/{slug}</p>}
        </div>
        {projectId && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-clay hover:text-clay-dark"
          >
            Delete
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <label className="block text-sm">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-clay"
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={8}
            className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-clay"
          />
        </label>
        <fieldset className="text-sm">
          <legend>Status</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(["draft", "scheduled", "published"] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-md border px-4 py-2 capitalize ${
                  status === value ? "border-ink bg-ink text-paper" : "border-line bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={status === value}
                  onChange={() => {
                    setStatus(value);
                    if (value === "scheduled" && !publishLocal) {
                      const soon = new Date(Date.now() + 60 * 60 * 1000);
                      setPublishLocal(toDatetimeLocal(soon.toISOString()));
                    }
                  }}
                  className="sr-only"
                />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        {status === "scheduled" && (
          <label className="block text-sm">
            Publish at
            <input
              type="datetime-local"
              required
              value={publishLocal}
              onChange={(event) => setPublishLocal(event.target.value)}
              className="mt-2 w-full max-w-sm rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-clay"
            />
            <span className="mt-2 block text-xs text-ink-soft">
              Local time ({localTimeZone()}). Hidden on the public site until this moment.
            </span>
          </label>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-clay px-5 py-2.5 text-sm text-white hover:bg-clay-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : projectId ? "Save changes" : "Create project"}
        </button>
      </form>

      {projectId ? (
        <ImageManager projectId={projectId} images={images} onChange={setImages} />
      ) : (
        <p className="mt-10 rounded-md border border-dashed border-line bg-white px-4 py-6 text-sm text-ink-soft">
          Save the project first to upload images to Cloudinary.
        </p>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this project?"
          body="The record and every image in storage will be removed. This cannot be undone."
          confirmLabel="Delete project"
          busy={deleting}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => void onDelete()}
        />
      )}
    </div>
  );
}

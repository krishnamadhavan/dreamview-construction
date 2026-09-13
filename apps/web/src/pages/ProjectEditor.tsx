import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowIcon } from "../components/ArrowIcon";
import { api } from "../api";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ImageManager } from "../components/ImageManager";
import { fromDatetimeLocal, localTimeZone, toDatetimeLocal } from "../lib/datetime";
import { PROJECT_KINDS, type ProjectKind } from "../lib/projectKind";
import { useToast } from "../toast";
import type { Project, ProjectImage, ProjectStatus } from "../types";

export function ProjectEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [kind, setKind] = useState<ProjectKind>("residence");
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
    setLocation(project.location);
    setYear(project.year);
    setKind(project.kind);
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
          location,
          year,
          kind,
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
          location,
          year,
          kind,
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
    return <p className="text-sm text-paper/50">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin" className="text-sm text-paper/50 hover:text-paper">
        ← Work
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">
            {isNew ? "New" : "Edit"}
          </p>
          <h1 className="display mt-1 text-5xl">{title || "Untitled project"}</h1>
          {slug && <p className="mt-2 font-mono text-xs text-paper/40">/{slug}</p>}
        </div>
        {projectId && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-gold/80 hover:text-gold"
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
            className="admin-field"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="block text-sm">
            Type
            <select value={kind} onChange={(event) => setKind(event.target.value as ProjectKind)} className="admin-field">
              {PROJECT_KINDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Location
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Bengaluru"
              className="admin-field"
            />
          </label>
          <label className="block text-sm">
            Year
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="2024"
              className="admin-field"
            />
          </label>
        </div>
        <label className="block text-sm">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={8}
            className="admin-field"
          />
        </label>
        <fieldset className="text-sm">
          <legend>Status</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(["draft", "scheduled", "published"] as const).map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-md border px-4 py-2 capitalize ${
                  status === value ? "border-gold bg-gold text-void" : "border-white/15 bg-[#161616]"
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
              className="admin-field max-w-sm"
            />
            <span className="mt-2 block text-xs text-paper/40">
              Local time ({localTimeZone()}). Hidden on the public site until this moment.
            </span>
          </label>
        )}
        <button type="submit" disabled={saving} className="admin-btn">
          {saving ? "Saving…" : projectId ? "Save changes" : "Create project"}
          <ArrowIcon />
        </button>
      </form>

      {projectId ? (
        <ImageManager projectId={projectId} images={images} onChange={setImages} />
      ) : (
        <p className="mt-10 border border-dashed border-white/15 px-4 py-6 text-sm text-paper/50">
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

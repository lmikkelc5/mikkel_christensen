"use client";

import { Search, Star, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PhotoUploadReview,
  type StagedAction,
  type StagedFile
} from "@/components/admin/photo-upload-review";
import type { PhotoRecord } from "@/lib/photo-types";

type EditablePhoto = PhotoRecord;

const emptyBatch = {
  trip: "",
  film: "",
  camera: "",
  tags: ""
};

const IMAGE_TYPES = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const COMMIT_BATCH_SIZE = 25;

type AnalysisResponse = {
  items: {
    name: string;
    size: number;
    hash: string;
    duplicate: StagedFile["duplicate"] | null;
  }[];
};

function isImageFile(file: File) {
  return file.type.startsWith("image/") || IMAGE_TYPES.test(file.name);
}

async function hashFile(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function PhotographyManager() {
  const [photos, setPhotos] = useState<EditablePhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState(emptyBatch);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [hashing, setHashing] = useState({ active: false, done: 0, total: 0 });
  const [committing, setCommitting] = useState({ active: false, done: 0, total: 0 });

  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activeId),
    [activeId, photos]
  );

  useEffect(() => {
    void loadPhotos();
  }, []);

  async function loadPhotos() {
    const response = await fetch("/api/admin/photos");
    const data = (await response.json()) as EditablePhoto[];
    setPhotos(data);
    if (!activeId && data[0]) setActiveId(data[0].id);
  }

  const filtered = useMemo(() => {
    return photos.filter((photo) => {
      const haystack = [
        photo.title,
        photo.description,
        photo.trip,
        photo.film,
        photo.camera,
        photo.lens,
        photo.location,
        ...photo.tags
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [photos, query]);

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function beginUpload(fileList: FileList | null) {
    setIsDragging(false);
    if (!fileList?.length) {
      setMessage("No files were detected in the drop.");
      return;
    }

    const files = Array.from(fileList).filter(isImageFile);
    if (!files.length) {
      setMessage("No supported image files were selected.");
      return;
    }

    setMessage("");
    setHashing({ active: true, done: 0, total: files.length });

    const signatures: { name: string; size: number; hash: string }[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      // eslint-disable-next-line no-await-in-loop
      const hash = await hashFile(file);
      signatures.push({ name: file.name, size: file.size, hash });
      setHashing({ active: true, done: index + 1, total: files.length });
    }

    let analysis: AnalysisResponse;
    try {
      const response = await fetch("/api/admin/photos/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: signatures })
      });
      if (!response.ok) throw new Error("Analyze failed");
      analysis = (await response.json()) as AnalysisResponse;
    } catch {
      setHashing({ active: false, done: 0, total: 0 });
      setMessage("Could not analyze the upload for duplicates. Please try again.");
      return;
    }

    const stagedFiles: StagedFile[] = files.map((file, index) => {
      const item = analysis.items[index];
      const duplicate = item?.duplicate ?? undefined;
      return {
        id: `${file.name}-${index}-${item?.hash ?? ""}`,
        file,
        name: file.name,
        size: file.size,
        hash: item?.hash ?? signatures[index].hash,
        status: duplicate ? "duplicate" : "new",
        duplicate,
        action: duplicate ? "skip" : "import",
        previewUrl: URL.createObjectURL(file)
      };
    });

    setHashing({ active: false, done: 0, total: 0 });
    setStaged(stagedFiles);
  }

  function setStagedAction(id: string, action: StagedAction) {
    setStaged((current) =>
      current.map((file) => (file.id === id ? { ...file, action } : file))
    );
  }

  function batchDuplicateAction(action: StagedAction) {
    setStaged((current) =>
      current.map((file) => (file.status === "duplicate" ? { ...file, action } : file))
    );
  }

  function clearStaged() {
    staged.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    setStaged([]);
    setCommitting({ active: false, done: 0, total: 0 });
  }

  async function confirmImport() {
    const toUpload = staged.filter(
      (file) => file.status === "new" || file.action !== "skip"
    );

    if (!toUpload.length) {
      clearStaged();
      setMessage("All duplicates were skipped. Nothing was imported.");
      return;
    }

    setCommitting({ active: true, done: 0, total: toUpload.length });

    const created: EditablePhoto[] = [];
    let replacedCount = 0;
    let done = 0;

    for (let start = 0; start < toUpload.length; start += COMMIT_BATCH_SIZE) {
      const chunk = toUpload.slice(start, start + COMMIT_BATCH_SIZE);
      const body = new FormData();
      for (const stagedFile of chunk) {
        const decision =
          stagedFile.action === "replace" && stagedFile.duplicate
            ? { action: "replace", replaceId: stagedFile.duplicate.existingId }
            : { action: "import" };
        body.append("files", stagedFile.file);
        body.append("decisions", JSON.stringify(decision));
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await fetch("/api/admin/photos", { method: "POST", body });
      if (response.ok) {
        // eslint-disable-next-line no-await-in-loop
        const data = (await response.json()) as {
          created: EditablePhoto[];
          replaced: EditablePhoto[];
        };
        created.push(...data.created);
        replacedCount += data.replaced?.length ?? 0;
      }

      done += chunk.length;
      setCommitting({ active: true, done, total: toUpload.length });
    }

    if (created[0]) {
      setActiveId(created[0].id);
      setSelectedIds(created.map((photo) => photo.id));
    }

    const skipped = staged.filter((file) => file.status === "duplicate" && file.action === "skip").length;
    setMessage(
      `Imported ${created.length} · replaced ${replacedCount} · skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}.`
    );

    clearStaged();
    await loadPhotos();
  }

  function getDroppedFiles(event: React.DragEvent<HTMLElement>) {
    if (event.dataTransfer.files?.length) {
      return event.dataTransfer.files;
    }

    const files = Array.from(event.dataTransfer.items ?? [])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (!files.length) return null;

    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    return transfer.files;
  }

  async function savePhoto(updates: Partial<EditablePhoto>) {
    if (!activePhoto) return;
    setSaving(true);
    const response = await fetch(`/api/admin/photos/${activePhoto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    setSaving(false);
    if (response.ok) {
      setMessage("Photo saved.");
      await loadPhotos();
    }
  }

  async function applyBatch() {
    if (!selectedIds.length) {
      setMessage("Select at least one photo for batch editing.");
      return;
    }

    const updates: Partial<EditablePhoto> = {};
    if (batch.trip) updates.trip = batch.trip;
    if (batch.film) updates.film = batch.film;
    if (batch.camera) updates.camera = batch.camera;
    if (batch.tags) {
      updates.tags = batch.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }

    setSaving(true);
    const response = await fetch("/api/admin/photos/batch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, updates })
    });
    setSaving(false);

    if (response.ok) {
      setMessage(`Updated ${selectedIds.length} photos.`);
      setBatch(emptyBatch);
      await loadPhotos();
    }
  }

  async function deletePhoto(id: string) {
    if (!window.confirm("Delete this photo and its files?")) return;
    await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    setSelectedIds((current) => current.filter((item) => item !== id));
    if (activeId === id) setActiveId("");
    setMessage("Photo deleted.");
    await loadPhotos();
  }

  async function replacePhoto(file: File) {
    if (!activePhoto) return;
    const body = new FormData();
    body.append("file", file);
    setSaving(true);
    await fetch(`/api/admin/photos/${activePhoto.id}/replace`, { method: "POST", body });
    setSaving(false);
    setMessage("Photo file replaced.");
    await loadPhotos();
  }

  const reviewing = hashing.active || staged.length > 0;

  return (
    <div className="space-y-8">
      {reviewing ? (
        <PhotoUploadReview
          files={staged}
          hashing={hashing}
          committing={committing}
          onSetAction={setStagedAction}
          onBatchDuplicateAction={batchDuplicateAction}
          onConfirm={() => void confirmImport()}
          onCancel={clearStaged}
        />
      ) : (
        <div className="surface space-y-4 p-5">
          {message ? <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p> : null}
          <div
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-6 py-8 text-center transition ${
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                : "border-current"
            }`}
            onClick={() => uploadInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                uploadInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void beginUpload(getDroppedFiles(event));
              if (uploadInputRef.current) {
                uploadInputRef.current.value = "";
              }
            }}
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm font-medium">Upload one or many photos</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Drag photos here or click to browse. Files are checked for exact duplicates before importing.
            </span>
            <input
              ref={uploadInputRef}
              className="hidden"
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => void beginUpload(event.target.files)}
            />
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="surface space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-2xl border px-3 py-2">
            <Search className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search photos"
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="max-h-[70vh] space-y-2 overflow-y-auto">
            {filtered.map((photo) => (
              <div
                key={photo.id}
                className={`rounded-2xl border p-3 ${activeId === photo.id ? "border-[var(--color-accent)]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(photo.id)}
                    onChange={() => toggleSelected(photo.id)}
                  />
                  <button type="button" className="flex-1 text-left" onClick={() => setActiveId(photo.id)}>
                    <img
                      src={`/photography/originals/${photo.file}`}
                      alt={photo.title || photo.file}
                      className="mb-2 aspect-square w-full rounded-xl object-cover"
                    />
                    <p className="text-sm font-medium">{photo.title || photo.file}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{photo.trip || "No trip"}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="surface space-y-4 p-5">
            <h2 className="text-lg font-semibold">Batch edit {selectedIds.length ? `(${selectedIds.length} selected)` : ""}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Trip" value={batch.trip} onChange={(trip) => setBatch((current) => ({ ...current, trip }))} />
              <Field label="Film" value={batch.film} onChange={(film) => setBatch((current) => ({ ...current, film }))} />
              <Field label="Camera" value={batch.camera} onChange={(camera) => setBatch((current) => ({ ...current, camera }))} />
              <Field label="Tags (comma-separated)" value={batch.tags} onChange={(tags) => setBatch((current) => ({ ...current, tags }))} />
            </div>
            <Button type="button" onClick={applyBatch} disabled={saving || !selectedIds.length}>
              Apply to selected
            </Button>
          </div>

          {activePhoto ? (
            <div className="surface space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Edit photo</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void savePhoto({ favorite: !activePhoto.favorite })}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {activePhoto.favorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void savePhoto({ featured: !activePhoto.featured })}
                  >
                    {activePhoto.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
                    onClick={() => void deletePhoto(activePhoto.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              <img
                src={`/photography/originals/${activePhoto.file}`}
                alt={activePhoto.title || activePhoto.file}
                className="max-h-80 rounded-3xl object-cover"
              />

              <PhotoEditor photo={activePhoto} onSave={savePhoto} onReplace={replacePhoto} saving={saving} />
            </div>
          ) : (
            <div className="surface p-5 text-sm text-[var(--color-muted-foreground)]">
              Upload photos or select one from the library to edit metadata.
            </div>
          )}

        </section>
      </div>
    </div>
  );
}

function PhotoEditor({
  photo,
  onSave,
  onReplace,
  saving
}: {
  photo: EditablePhoto;
  onSave: (updates: Partial<EditablePhoto>) => Promise<void>;
  onReplace: (file: File) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState(photo);

  useEffect(() => {
    setForm(photo);
  }, [photo]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title || ""} onChange={(title) => setForm((current) => ({ ...current, title }))} />
        <Field label="Trip" value={form.trip || ""} onChange={(trip) => setForm((current) => ({ ...current, trip }))} />
        <Field label="Film" value={form.film || ""} onChange={(film) => setForm((current) => ({ ...current, film }))} />
        <Field label="Camera" value={form.camera || ""} onChange={(camera) => setForm((current) => ({ ...current, camera }))} />
        <Field label="Lens" value={form.lens || ""} onChange={(lens) => setForm((current) => ({ ...current, lens }))} />
        <Field label="Location" value={form.location || ""} onChange={(location) => setForm((current) => ({ ...current, location }))} />
        <Field label="Date taken" type="date" value={(form.dateTaken || "").slice(0, 10)} onChange={(dateTaken) => setForm((current) => ({ ...current, dateTaken }))} />
        <Field label="Tags" value={form.tags.join(", ")} onChange={(tags) => setForm((current) => ({ ...current, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) }))} />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Description</span>
        <textarea
          value={form.description || ""}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={4}
          className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none"
        />
      </label>

      <dl className="grid gap-3 rounded-2xl bg-[var(--color-accent-soft)] p-4 text-sm md:grid-cols-2">
        <ReadOnly label="ISO" value={form.iso} />
        <ReadOnly label="Aperture" value={form.aperture} />
        <ReadOnly label="Shutter" value={form.shutterSpeed} />
        <ReadOnly label="Focal length" value={form.focalLength} />
        <ReadOnly label="Latitude" value={form.latitude?.toString()} />
        <ReadOnly label="Longitude" value={form.longitude?.toString()} />
      </dl>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={saving}
          onClick={() =>
            void onSave({
              title: form.title,
              description: form.description,
              trip: form.trip,
              film: form.film,
              camera: form.camera,
              lens: form.lens,
              location: form.location,
              dateTaken: form.dateTaken,
              tags: form.tags,
              featured: form.featured,
              favorite: form.favorite
            })
          }
        >
          {saving ? "Saving..." : "Save photo"}
        </Button>
        <label className="inline-flex cursor-pointer items-center rounded-full border px-4 py-3 text-sm">
          Replace file
          <input className="hidden" type="file" accept="image/*" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onReplace(file);
          }} />
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none"
      />
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

"use client";

import { LogOut, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import type { CollectionName, ProjectFrontmatter, RecipeFrontmatter, ArticleFrontmatter } from "@/lib/content";

import { RichTextEditor } from "./rich-text-editor";
import { PhotographyManager } from "./photography-manager";

type Section = CollectionName | "photography";

type ContentRecord = {
  slug: string;
  metadata: Record<string, unknown>;
  html: string;
};

const sections: Section[] = ["articles", "recipes", "projects", "photography"];

export function AdminDashboard() {
  const [section, setSection] = useState<Section>("articles");
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (section !== "photography") {
      void loadSection(section);
    }
  }, [section]);

  const selectedItem = useMemo(
    () => items.find((item) => item.slug === selectedSlug),
    [items, selectedSlug]
  );

  async function loadSection(next: Section) {
    if (next === "photography") return;

    setMessage("");
    const response = await fetch(`/api/admin/content/${next}`);
    const data = (await response.json()) as ContentRecord[];
    setItems(data);
    setSelectedSlug(data[0]?.slug || "");
    if (data[0]) {
      setForm({ ...data[0].metadata, slug: data[0].slug });
      setHtml(data[0].html);
    } else {
      resetContentForm(next);
    }
  }

  function resetContentForm(next: CollectionName) {
    setSelectedSlug("");
    setHtml(defaultHtml(next));
    setForm(defaultMetadata(next));
  }

  async function saveCurrent() {
    if (section === "photography") return;

    setSaving(true);
    setMessage("");

    const collection = section;
    const isEditing = Boolean(selectedItem);
    const endpoint = isEditing
      ? `/api/admin/content/${collection}/${selectedSlug}`
      : `/api/admin/content/${collection}`;
    const method = isEditing ? "PUT" : "POST";
    const payload = {
      slug: String(form.slug || ""),
      metadata: normalizeMetadata(collection, form),
      html
    };

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setMessage("Saved.");
      await loadSection(collection);
    }

    setSaving(false);
  }

  async function deleteCurrent() {
    if (section === "photography") return;
    if (!selectedSlug) return;
    if (!window.confirm("Delete this item?")) return;

    await fetch(`/api/admin/content/${section}/${selectedSlug}`, { method: "DELETE" });
    setMessage("Deleted.");
    await loadSection(section);
  }

  async function uploadForCurrent(files: FileList | null) {
    if (section === "photography") return;
    if (!files?.length) return;

    const slug = String(form.slug || selectedSlug || "");
    if (!slug) {
      setMessage("Save the entry first so files have a destination.");
      return;
    }

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("scope", `content/${section}/${slug}`);
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url: string };
      setHtml((current) => `${current}<p><img src="${data.url}" alt="" /></p>`);
    }
    setMessage("Files uploaded and inserted.");
  }

  return (
    <div className="page-shell space-y-8 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-accent)]">Admin</p>
          <h1 className="text-3xl font-semibold">Manage site content</h1>
        </div>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSection(item)}
            className={`rounded-full px-4 py-2 text-sm ${section === item ? "bg-[var(--color-foreground)] text-[var(--color-background)]" : "bg-[var(--color-accent-soft)]"}`}
          >
            {labelForSection(item)}
          </button>
        ))}
      </div>

      {section === "photography" ? (
        <PhotographyManager />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Existing {labelForSection(section)}</h2>
              <button
                type="button"
                onClick={() => resetContentForm(section)}
                className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)]"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(item.slug);
                    setForm({ ...item.metadata, slug: item.slug });
                    setHtml(item.html);
                  }}
                  className="block w-full rounded-2xl border px-4 py-3 text-left hover:bg-[var(--color-accent-soft)]"
                >
                  <p className="font-medium">{String(item.metadata.title || item.slug)}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{item.slug}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="surface space-y-6 p-6">
            <ContentForm
              section={section}
              form={form}
              setForm={setForm}
              html={html}
              setHtml={setHtml}
              uploadForCurrent={uploadForCurrent}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={saveCurrent} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <button
                type="button"
                onClick={deleteCurrent}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              {message ? <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p> : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ContentForm({
  section,
  form,
  setForm,
  html,
  setHtml,
  uploadForCurrent
}: {
  section: CollectionName;
  form: Record<string, unknown>;
  setForm: Dispatch<SetStateAction<Record<string, unknown>>>;
  html: string;
  setHtml: (value: string) => void;
  uploadForCurrent: (files: FileList | null) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug" value={String(form.slug || "")} onChange={(value) => patchForm(setForm, "slug", value)} />
        <Field label="Title" value={String(form.title || "")} onChange={(value) => patchForm(setForm, "title", value)} />
        {section === "articles" ? (
          <Field label="Subtitle" value={String(form.subtitle || "")} onChange={(value) => patchForm(setForm, "subtitle", value)} />
        ) : null}
        <Field label="Description" value={String(form.description || "")} onChange={(value) => patchForm(setForm, "description", value)} />
        <Field label="Publish date" type="date" value={String(form.date || "")} onChange={(value) => patchForm(setForm, "date", value)} />
        <Field label="Cover image" value={String(form.coverImage || "")} onChange={(value) => patchForm(setForm, "coverImage", value)} />
        <Field label="Tags (comma-separated)" value={stringifyList(form.tags)} onChange={(value) => patchForm(setForm, "tags", value)} />
        {section === "articles" ? (
          <Field label="Category" value={String(form.category || "")} onChange={(value) => patchForm(setForm, "category", value)} />
        ) : null}
        {section === "projects" ? (
          <>
            <Field label="Status" value={String(form.status || "")} onChange={(value) => patchForm(setForm, "status", value)} />
            <Field label="Technologies (comma-separated)" value={stringifyList(form.technologies)} onChange={(value) => patchForm(setForm, "technologies", value)} />
            <Field label="GitHub link" value={String(form.github || "")} onChange={(value) => patchForm(setForm, "github", value)} />
            <Field label="Live demo link" value={String(form.demo || "")} onChange={(value) => patchForm(setForm, "demo", value)} />
            <Field label="Start date" type="date" value={String(form.startDate || "")} onChange={(value) => patchForm(setForm, "startDate", value)} />
            <Field label="Completion date" type="date" value={String(form.completionDate || "")} onChange={(value) => patchForm(setForm, "completionDate", value)} />
          </>
        ) : null}
        {section === "recipes" ? (
          <>
            <Field label="Prep time" value={String(form.prepTime || "")} onChange={(value) => patchForm(setForm, "prepTime", value)} />
            <Field label="Cook time" value={String(form.cookTime || "")} onChange={(value) => patchForm(setForm, "cookTime", value)} />
            <Field label="Total time" value={String(form.totalTime || "")} onChange={(value) => patchForm(setForm, "totalTime", value)} />
            <Field label="Servings" value={String(form.servings || "")} onChange={(value) => patchForm(setForm, "servings", value)} />
            <Field label="Difficulty" value={String(form.difficulty || "")} onChange={(value) => patchForm(setForm, "difficulty", value)} />
          </>
        ) : null}
      </div>

      {section === "recipes" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <TextareaField label="Ingredients (one per line)" value={stringifyLines(form.ingredients)} onChange={(value) => patchForm(setForm, "ingredients", value)} />
          <TextareaField label="Nutrition (one per line)" value={stringifyLines(form.nutrition)} onChange={(value) => patchForm(setForm, "nutrition", value)} />
          <TextareaField label="Notes (one per line)" value={stringifyLines(form.notes)} onChange={(value) => patchForm(setForm, "notes", value)} />
          <TextareaField label="Images (one per line)" value={stringifyLines(form.images)} onChange={(value) => patchForm(setForm, "images", value)} />
        </div>
      ) : null}

      {section === "projects" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <TextareaField label="Images (one per line)" value={stringifyLines(form.images)} onChange={(value) => patchForm(setForm, "images", value)} />
          <TextareaField label="Lessons learned (one per line)" value={stringifyLines(form.lessons)} onChange={(value) => patchForm(setForm, "lessons", value)} />
          <TextareaField label="Future improvements (one per line)" value={stringifyLines(form.improvements)} onChange={(value) => patchForm(setForm, "improvements", value)} />
        </div>
      ) : null}

      <ToggleField
        label="Featured"
        checked={Boolean(form.featured)}
        onChange={(value) => patchForm(setForm, "featured", value)}
      />

      <UploadField label="Upload images or files" onChange={uploadForCurrent} />

      <RichTextEditor
        label={section === "projects" ? "Project description" : section === "recipes" ? "Instructions" : "Body"}
        value={html}
        onChange={setHtml}
      />
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function UploadField({
  label,
  onChange,
  multiple = true
}: {
  label: string;
  onChange: (files: FileList | null) => Promise<void>;
  multiple?: boolean;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-6 py-8 text-center">
      <Upload className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-[var(--color-muted-foreground)]">
        Drag files here or click to browse
      </span>
      <input className="hidden" type="file" multiple={multiple} onChange={(event) => void onChange(event.target.files)} />
    </label>
  );
}

function patchForm(
  setForm: Dispatch<SetStateAction<Record<string, unknown>>>,
  key: string,
  value: unknown
) {
  setForm((current) => ({ ...current, [key]: value }));
}

function defaultHtml(section: CollectionName) {
  if (section === "recipes") return "<h2>Instructions</h2><ol><li>Step one</li></ol>";
  if (section === "projects") return "<h2>Overview</h2><p>Describe the project here.</p>";
  return "<h2>Introduction</h2><p>Start writing here.</p>";
}

function defaultMetadata(section: CollectionName) {
  const base = {
    slug: "",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    tags: "",
    coverImage: "",
    featured: false
  };

  if (section === "articles") {
    return { ...base, subtitle: "", category: "" };
  }
  if (section === "recipes") {
    return {
      ...base,
      prepTime: "",
      cookTime: "",
      totalTime: "",
      servings: "",
      difficulty: "Easy",
      ingredients: "",
      images: "",
      notes: "",
      nutrition: ""
    };
  }

  return {
    ...base,
    status: "Planned",
    technologies: "",
    github: "",
    demo: "",
    startDate: "",
    completionDate: "",
    images: "",
    lessons: "",
    improvements: ""
  };
}

function normalizeMetadata(section: CollectionName, form: Record<string, unknown>) {
  if (section === "articles") {
    const metadata: ArticleFrontmatter = {
      title: String(form.title || ""),
      subtitle: String(form.subtitle || ""),
      description: String(form.description || ""),
      date: String(form.date || ""),
      category: String(form.category || ""),
      tags: parseCommaList(String(form.tags || "")),
      featured: Boolean(form.featured),
      coverImage: String(form.coverImage || "")
    };
    return metadata;
  }

  if (section === "recipes") {
    const metadata: RecipeFrontmatter = {
      title: String(form.title || ""),
      description: String(form.description || ""),
      date: String(form.date || ""),
      tags: parseCommaList(String(form.tags || "")),
      featured: Boolean(form.featured),
      coverImage: String(form.coverImage || ""),
      prepTime: String(form.prepTime || ""),
      cookTime: String(form.cookTime || ""),
      totalTime: String(form.totalTime || ""),
      servings: String(form.servings || ""),
      difficulty: String(form.difficulty || "Easy") as RecipeFrontmatter["difficulty"],
      ingredients: parseLineList(String(form.ingredients || "")),
      images: parseLineList(String(form.images || "")),
      notes: parseLineList(String(form.notes || "")),
      nutrition: parseLineList(String(form.nutrition || ""))
    };
    return metadata;
  }

  const metadata: ProjectFrontmatter = {
    title: String(form.title || ""),
    description: String(form.description || ""),
    date: String(form.date || ""),
    tags: parseCommaList(String(form.tags || "")),
    featured: Boolean(form.featured),
    coverImage: String(form.coverImage || ""),
    status: String(form.status || "Planned") as ProjectFrontmatter["status"],
    technologies: parseCommaList(String(form.technologies || "")),
    github: String(form.github || ""),
    demo: String(form.demo || ""),
    startDate: String(form.startDate || ""),
    completionDate: String(form.completionDate || ""),
    images: parseLineList(String(form.images || "")),
    lessons: parseLineList(String(form.lessons || "")),
    improvements: parseLineList(String(form.improvements || ""))
  };
  return metadata;
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function stringifyLines(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : String(value || "");
}

function labelForSection(section: Section) {
  return section.charAt(0).toUpperCase() + section.slice(1);
}

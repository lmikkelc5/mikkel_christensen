import fs from "node:fs";
import path from "node:path";

import type { CollectionMetadataMap, CollectionName } from "./content-schema";
import { sanitizeStoredHtml } from "./html-utils";
import { slugToTitle } from "./utils";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PUBLIC_ROOT = path.join(process.cwd(), "public");

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function getCollectionRoot(collection: CollectionName) {
  return path.join(CONTENT_ROOT, collection);
}

export function getEntryDir(collection: CollectionName, slug: string) {
  return path.join(getCollectionRoot(collection), slug);
}

export function getHtmlFileName(collection: CollectionName) {
  if (collection === "articles") return "article.html";
  if (collection === "recipes") return "recipe.html";
  return "project.html";
}

export function readEntry<K extends CollectionName>(collection: K, slug: string) {
  const entryDir = getEntryDir(collection, slug);
  const metadata = JSON.parse(
    fs.readFileSync(path.join(entryDir, "metadata.json"), "utf8")
  ) as CollectionMetadataMap[K];
  const htmlPath = path.join(entryDir, getHtmlFileName(collection));
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";

  return {
    slug,
    metadata,
    html
  };
}

export function listEntries<K extends CollectionName>(collection: K) {
  const root = getCollectionRoot(collection);
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root)
    .filter((slug) => fs.statSync(path.join(root, slug)).isDirectory())
    .map((slug) => readEntry(collection, slug))
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    );
}

export function writeEntry<K extends CollectionName>(
  collection: K,
  input: { slug?: string; metadata: CollectionMetadataMap[K]; html: string },
  existingSlug?: string
) {
  const desiredSlug = slugify(input.slug || input.metadata.title || slugToTitle("untitled"));
  const fromSlug = existingSlug || desiredSlug;
  const fromDir = getEntryDir(collection, fromSlug);
  const targetDir = getEntryDir(collection, desiredSlug);

  ensureDir(getCollectionRoot(collection));

  if (existingSlug && existingSlug !== desiredSlug && fs.existsSync(fromDir)) {
    fs.renameSync(fromDir, targetDir);
  } else {
    ensureDir(targetDir);
  }

  fs.writeFileSync(
    path.join(targetDir, "metadata.json"),
    JSON.stringify(input.metadata, null, 2)
  );
  fs.writeFileSync(path.join(targetDir, getHtmlFileName(collection)), sanitizeStoredHtml(input.html));

  return desiredSlug;
}

export function deleteEntry(collection: CollectionName, slug: string) {
  fs.rmSync(getEntryDir(collection, slug), { recursive: true, force: true });
}

export function saveUploadedFile(relativeDir: string, fileName: string, buffer: Buffer) {
  const targetDir = path.join(PUBLIC_ROOT, relativeDir);
  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, fileName), buffer);
  return `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;
}

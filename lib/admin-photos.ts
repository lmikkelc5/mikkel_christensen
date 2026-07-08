import fs from "node:fs";
import path from "node:path";

import exifr from "exifr";

import {
  ensurePhotoDirs,
  getOriginalPath,
  getThumbnailPath,
  readPhotoRecords,
  thumbnailExists,
  writePhotoRecords
} from "./photo-store";
import { findDuplicate, hashBuffer, type UploadSignature } from "./photo-duplicates";
import type { PhotoRecord } from "./photo-types";
import { slugify, slugToTitle } from "./utils";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"];

export async function extractExifFields(filePath: string) {
  try {
    const exif = await exifr.parse(filePath);
    if (!exif) return {};

    return {
      dateTaken: exif.DateTimeOriginal?.toISOString?.() || exif.CreateDate?.toISOString?.(),
      camera: exif.Model as string | undefined,
      lens: exif.LensModel as string | undefined,
      iso: exif.ISO ? String(exif.ISO) : undefined,
      aperture: exif.FNumber ? `f/${Number(exif.FNumber).toFixed(1)}` : undefined,
      shutterSpeed: exif.ExposureTime ? `${exif.ExposureTime}s` : undefined,
      focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : undefined,
      latitude: typeof exif.latitude === "number" ? exif.latitude : undefined,
      longitude: typeof exif.longitude === "number" ? exif.longitude : undefined,
      location: [exif.city, exif.state, exif.country].filter(Boolean).join(", ") || undefined
    };
  } catch {
    return {};
  }
}

function uniqueId(baseName: string, existingIds: Set<string>) {
  let candidate = slugify(baseName) || "photo";
  let counter = 1;

  while (existingIds.has(candidate)) {
    candidate = `${slugify(baseName)}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function uniqueFileName(fileName: string) {
  ensurePhotoDirs();
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  let candidate = fileName;
  let counter = 1;

  while (fs.existsSync(getOriginalPath(candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter += 1;
  }

  return candidate;
}

async function generateThumbnail(filePath: string, id: string) {
  try {
    const sharp = (await import("sharp")).default;
    await sharp(filePath)
      .rotate()
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(getThumbnailPath(id));
  } catch {
    // Thumbnail generation is best-effort; originals still work.
  }
}

function thumbnailSrcFor(record: PhotoRecord) {
  return thumbnailExists(record.id)
    ? `/photography/thumbnails/${record.id}.webp`
    : `/photography/originals/${record.file}`;
}

export type UploadAnalysisItem = {
  name: string;
  size: number;
  hash: string;
  duplicate: {
    type: string;
    strategy: string;
    existingId: string;
    existingFile: string;
    existingTitle?: string;
    existingThumb: string;
    existingAddedAt: string;
    existingSize?: number;
  } | null;
};

/**
 * Compare a batch of upload signatures against the existing library without
 * writing anything. Returns per-file duplicate details plus counts so the UI
 * can show a summary before importing.
 */
/**
 * Ensure existing records have a stored SHA-256 hash and size. Photos imported
 * before duplicate detection existed have neither, so we compute them once from
 * disk and persist. This keeps exact-duplicate detection reliable across the
 * whole library without a separate migration step.
 */
function backfillMissingHashes() {
  const records = readPhotoRecords();
  let changed = false;

  for (const record of records) {
    if (record.hash && typeof record.size === "number") continue;
    const originalPath = getOriginalPath(record.file);
    if (!fs.existsSync(originalPath)) continue;

    const buffer = fs.readFileSync(originalPath);
    record.hash = hashBuffer(buffer);
    record.size = buffer.length;
    changed = true;
  }

  if (changed) writePhotoRecords(records);
  return records;
}

export function analyzeUploads(signatures: UploadSignature[]) {
  const records = backfillMissingHashes();

  const items: UploadAnalysisItem[] = signatures.map((signature) => {
    const match = findDuplicate(signature, records);
    if (!match) {
      return { name: signature.name, size: signature.size, hash: signature.hash, duplicate: null };
    }

    const existing = records.find((record) => record.id === match.existingId);
    if (!existing) {
      return { name: signature.name, size: signature.size, hash: signature.hash, duplicate: null };
    }

    return {
      name: signature.name,
      size: signature.size,
      hash: signature.hash,
      duplicate: {
        type: match.type,
        strategy: match.strategy,
        existingId: existing.id,
        existingFile: existing.file,
        existingTitle: existing.title,
        existingThumb: thumbnailSrcFor(existing),
        existingAddedAt: existing.addedAt,
        existingSize: existing.size
      }
    };
  });

  const duplicateCount = items.filter((item) => item.duplicate).length;
  return { items, newCount: items.length - duplicateCount, duplicateCount };
}

export type UploadDecision = { action: "import" | "replace"; replaceId?: string };

/**
 * Import a batch of files according to a per-file decision. Files the user
 * chose to skip are simply not included in `entries`, so nothing changes for
 * them. "import" creates a new record; "replace" overwrites the file bytes and
 * technical metadata of an existing record while keeping its id and edits.
 */
export async function importPhotos(entries: { file: File; decision: UploadDecision }[]) {
  const records = readPhotoRecords();
  const existingIds = new Set(records.map((record) => record.id));
  const created: PhotoRecord[] = [];
  const replaced: PhotoRecord[] = [];
  const skipped: string[] = [];

  for (const { file, decision } of entries) {
    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      skipped.push(file.name);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = hashBuffer(buffer);

    if (decision.action === "replace" && decision.replaceId) {
      const index = records.findIndex((record) => record.id === decision.replaceId);
      if (index !== -1) {
        const record = records[index];
        const originalPath = getOriginalPath(record.file);
        fs.writeFileSync(originalPath, buffer);
        const exif = await extractExifFields(originalPath);
        await generateThumbnail(originalPath, record.id);
        records[index] = {
          ...record,
          ...exif,
          hash,
          size: buffer.length,
          addedAt: new Date().toISOString()
        };
        replaced.push(records[index]);
        continue;
      }
    }

    const fileName = uniqueFileName(file.name);
    const id = uniqueId(path.basename(fileName, ext), existingIds);
    const originalPath = getOriginalPath(fileName);

    fs.writeFileSync(originalPath, buffer);
    const exif = await extractExifFields(originalPath);

    const record: PhotoRecord = {
      id,
      file: fileName,
      title: slugToTitle(path.basename(fileName, ext)),
      description: "",
      tags: [],
      featured: false,
      favorite: false,
      addedAt: new Date().toISOString(),
      ...exif,
      hash,
      size: buffer.length
    };

    await generateThumbnail(originalPath, id);
    records.push(record);
    existingIds.add(id);
    created.push(record);
  }

  writePhotoRecords(records);
  return { created, replaced, skipped };
}

export function updatePhoto(id: string, updates: Partial<PhotoRecord>) {
  const records = readPhotoRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;

  records[index] = {
    ...records[index],
    ...updates,
    id: records[index].id,
    file: records[index].file,
    tags: updates.tags ?? records[index].tags
  };

  writePhotoRecords(records);
  return records[index];
}

export function batchUpdatePhotos(ids: string[], updates: Partial<PhotoRecord>) {
  const records = readPhotoRecords();
  const idSet = new Set(ids);

  const next = records.map((record) => {
    if (!idSet.has(record.id)) return record;

    return {
      ...record,
      ...updates,
      id: record.id,
      file: record.file,
      tags: updates.tags ? Array.from(new Set([...record.tags, ...updates.tags])) : record.tags
    };
  });

  writePhotoRecords(next);
  return next.filter((record) => idSet.has(record.id));
}

export function deletePhoto(id: string) {
  const records = readPhotoRecords();
  const record = records.find((item) => item.id === id);
  if (!record) return false;

  const originalPath = getOriginalPath(record.file);
  const thumbPath = getThumbnailPath(id);

  if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

  writePhotoRecords(records.filter((item) => item.id !== id));
  return true;
}

export async function replacePhotoFile(id: string, file: File) {
  const records = readPhotoRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const record = records[index];
  const buffer = Buffer.from(await file.arrayBuffer());
  const originalPath = getOriginalPath(record.file);

  fs.writeFileSync(originalPath, buffer);
  const exif = await extractExifFields(originalPath);
  await generateThumbnail(originalPath, id);

  records[index] = {
    ...record,
    ...exif,
    hash: hashBuffer(buffer),
    size: buffer.length,
    addedAt: new Date().toISOString()
  };

  writePhotoRecords(records);
  return records[index];
}

export function listAdminPhotos() {
  return readPhotoRecords().sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}

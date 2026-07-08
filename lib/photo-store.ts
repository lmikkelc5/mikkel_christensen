import fs from "node:fs";
import path from "node:path";

import type { PhotoRecord } from "./photo-types";

const DATA_DIR = path.join(process.cwd(), "data");
const PHOTOS_JSON = path.join(DATA_DIR, "photos.json");
export const ORIGINALS_DIR = path.join(process.cwd(), "public", "photography", "originals");
export const THUMBNAILS_DIR = path.join(process.cwd(), "public", "photography", "thumbnails");

export function ensurePhotoDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

export function readPhotoRecords(): PhotoRecord[] {
  ensurePhotoDirs();
  if (!fs.existsSync(PHOTOS_JSON)) {
    fs.writeFileSync(PHOTOS_JSON, "[]\n");
    return [];
  }

  return JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf8")) as PhotoRecord[];
}

export function writePhotoRecords(records: PhotoRecord[]) {
  ensurePhotoDirs();
  fs.writeFileSync(PHOTOS_JSON, `${JSON.stringify(records, null, 2)}\n`);
}

export function getOriginalPath(fileName: string) {
  return path.join(ORIGINALS_DIR, fileName);
}

export function getThumbnailPath(id: string) {
  return path.join(THUMBNAILS_DIR, `${id}.webp`);
}

export function thumbnailExists(id: string) {
  return fs.existsSync(getThumbnailPath(id));
}

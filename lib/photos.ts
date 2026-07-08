import type { Photo, PhotoFilters, PhotoRecord, GalleryGroup, GalleryType } from "./photo-types";
import { readPhotoRecords, thumbnailExists } from "./photo-store";
import { slugify } from "./utils";

function enrichPhoto(record: PhotoRecord): Photo {
  const year = record.dateTaken ? new Date(record.dateTaken).getFullYear().toString() : undefined;

  return {
    ...record,
    year,
    originalSrc: `/photography/originals/${record.file}`,
    thumbnailSrc: thumbnailExists(record.id)
      ? `/photography/thumbnails/${record.id}.webp`
      : `/photography/originals/${record.file}`,
    href: `/photography/photo/${record.id}`
  };
}

export function getPhotos(): Photo[] {
  return readPhotoRecords()
    .map(enrichPhoto)
    .sort((a, b) => {
      const aDate = a.dateTaken || a.addedAt;
      const bDate = b.dateTaken || b.addedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export function getPhotoById(id: string) {
  return getPhotos().find((photo) => photo.id === id);
}

export function getFeaturedPhotos(limit?: number) {
  const photos = getPhotos().filter((photo) => photo.featured);
  return limit ? photos.slice(0, limit) : photos;
}

export function getFavoritePhotos() {
  return getPhotos().filter((photo) => photo.favorite);
}

export function getRecentPhotos(limit = 6) {
  return getPhotos().slice(0, limit);
}

function matchesQuery(photo: Photo, query: string) {
  const haystack = [
    photo.title,
    photo.description,
    photo.camera,
    photo.lens,
    photo.film,
    photo.trip,
    photo.location,
    photo.year,
    ...(photo.tags ?? [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function filterPhotos(photos: Photo[], filters: PhotoFilters) {
  return photos.filter((photo) => {
    if (filters.query && !matchesQuery(photo, filters.query)) return false;
    if (filters.film && photo.film !== filters.film) return false;
    if (filters.camera && photo.camera !== filters.camera) return false;
    if (filters.lens && photo.lens !== filters.lens) return false;
    if (filters.year && photo.year !== filters.year) return false;
    if (filters.trip && photo.trip !== filters.trip) return false;
    if (filters.favorite && !photo.favorite) return false;
    if (filters.featured && !photo.featured) return false;
    return true;
  });
}

function groupByField(photos: Photo[], field: keyof PhotoRecord): GalleryGroup[] {
  const groups = new Map<string, Photo[]>();

  for (const photo of photos) {
    const value = photo[field];
    if (!value || typeof value !== "string") continue;
    const current = groups.get(value) ?? [];
    current.push(photo);
    groups.set(value, current);
  }

  return Array.from(groups.entries())
    .map(([label, items]) => ({
      label,
      slug: slugify(label),
      count: items.length,
      cover: items[0]
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getYearGalleries(): GalleryGroup[] {
  const groups = new Map<string, Photo[]>();

  for (const photo of getPhotos()) {
    if (!photo.year) continue;
    const current = groups.get(photo.year) ?? [];
    current.push(photo);
    groups.set(photo.year, current);
  }

  return Array.from(groups.entries())
    .map(([label, items]) => ({
      label,
      slug: label,
      count: items.length,
      cover: items[0]
    }))
    .sort((a, b) => Number(b.label) - Number(a.label));
}

export function getGalleries(type: GalleryType): GalleryGroup[] {
  if (type === "year") return getYearGalleries();
  if (type === "film") return groupByField(getPhotos(), "film");
  if (type === "trip") return groupByField(getPhotos(), "trip");
  return groupByField(getPhotos(), "camera");
}

export function getGalleryPhotos(type: GalleryType, slug: string) {
  const photos = getPhotos();

  if (type === "year") {
    return photos.filter((photo) => photo.year === slug);
  }

  const field = type === "film" ? "film" : type === "trip" ? "trip" : "camera";
  return photos.filter((photo) => {
    const value = photo[field];
    return typeof value === "string" && slugify(value) === slug;
  });
}

export function getGalleryLabel(type: GalleryType, slug: string) {
  const galleries = getGalleries(type);
  return galleries.find((gallery) => gallery.slug === slug)?.label ?? slug;
}

export function getRelatedPhotos(photo: Photo, limit = 6) {
  return getPhotos()
    .filter((item) => item.id !== photo.id)
    .map((item) => {
      let score = 0;
      if (photo.trip && item.trip === photo.trip) score += 3;
      if (photo.film && item.film === photo.film) score += 2;
      if (photo.camera && item.camera === photo.camera) score += 1;
      score += item.tags.filter((tag) => photo.tags.includes(tag)).length;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function getPrevNextPhoto(id: string) {
  const photos = getPhotos();
  const index = photos.findIndex((photo) => photo.id === id);

  return {
    previous: index > 0 ? photos[index - 1] : undefined,
    next: index < photos.length - 1 ? photos[index + 1] : undefined
  };
}

export function getFilterOptions(photos: Photo[]) {
  const unique = (values: Array<string | undefined>) =>
    Array.from(new Set(values.filter(Boolean) as string[])).sort();

  return {
    film: unique(photos.map((photo) => photo.film)),
    camera: unique(photos.map((photo) => photo.camera)),
    lens: unique(photos.map((photo) => photo.lens)),
    trip: unique(photos.map((photo) => photo.trip)),
    year: unique(photos.map((photo) => photo.year))
  };
}

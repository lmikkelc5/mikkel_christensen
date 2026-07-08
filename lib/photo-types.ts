export type PhotoRecord = {
  id: string;
  file: string;
  title?: string;
  description?: string;
  trip?: string;
  film?: string;
  camera?: string;
  lens?: string;
  dateTaken?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  iso?: string;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  tags: string[];
  featured?: boolean;
  favorite?: boolean;
  addedAt: string;
  hash?: string;
  size?: number;
};

export type Photo = PhotoRecord & {
  originalSrc: string;
  thumbnailSrc: string;
  href: string;
  year?: string;
};

export type GalleryGroup = {
  label: string;
  slug: string;
  count: number;
  cover?: Photo;
};

export type GalleryType = "film" | "trip" | "camera" | "year";

export type PhotoFilters = {
  query?: string;
  film?: string;
  camera?: string;
  lens?: string;
  year?: string;
  trip?: string;
  favorite?: boolean;
  featured?: boolean;
};

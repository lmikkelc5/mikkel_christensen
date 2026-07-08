"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Photo, PhotoFilters } from "@/lib/photo-types";
import { cn } from "@/lib/utils";

import { PhotoLightbox } from "./photo-lightbox";
import { PhotoImage } from "./photo-image";

type PhotoMasonryProps = {
  photos: Photo[];
  className?: string;
};

export function PhotoMasonry({ photos, className }: PhotoMasonryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!photos.length) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]">No photos match the current filters.</p>
    );
  }

  return (
    <>
      <div className={cn("columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3", className)}>
        {photos.map((photo, index) => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              className="group relative block w-full overflow-hidden rounded-3xl"
              onClick={() => setActiveIndex(index)}
            >
              <PhotoImage photo={photo} className="rounded-3xl" />
              <div className="absolute inset-x-0 bottom-0 bg-[color:color-mix(in_oklch,var(--color-foreground)_55%,transparent)] p-4 text-left text-white opacity-0 transition group-hover:opacity-100">
                <p className="font-medium">{photo.title || photo.file}</p>
                {photo.trip ? <p className="text-sm text-white/80">{photo.trip}</p> : null}
              </div>
            </button>
            <Link
              href={photo.href}
              className="mt-2 inline-block text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              View details
            </Link>
          </div>
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChange={setActiveIndex}
      />
    </>
  );
}

type PhotoLibraryProps = {
  photos: Photo[];
  filterOptions: {
    film: string[];
    camera: string[];
    lens: string[];
    trip: string[];
    year: string[];
  };
};

export function PhotoLibrary({ photos, filterOptions }: PhotoLibraryProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PhotoFilters>({});

  const filtered = useMemo(() => {
    return photos.filter((photo) => {
      const haystack = [
        photo.title,
        photo.description,
        photo.camera,
        photo.lens,
        photo.film,
        photo.trip,
        photo.location,
        photo.year,
        ...photo.tags
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (filters.film && photo.film !== filters.film) return false;
      if (filters.camera && photo.camera !== filters.camera) return false;
      if (filters.lens && photo.lens !== filters.lens) return false;
      if (filters.year && photo.year !== filters.year) return false;
      if (filters.trip && photo.trip !== filters.trip) return false;
      if (filters.favorite && !photo.favorite) return false;
      if (filters.featured && !photo.featured) return false;
      return true;
    });
  }, [filters, photos, query]);

  return (
    <div className="space-y-8">
      <div className="surface space-y-5 p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Search library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, camera, film, trip, tags..."
            className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <FilterRow
          label="Film"
          value={filters.film}
          options={filterOptions.film}
          onChange={(film) => setFilters((current) => ({ ...current, film: film || undefined }))}
        />
        <FilterRow
          label="Camera"
          value={filters.camera}
          options={filterOptions.camera}
          onChange={(camera) => setFilters((current) => ({ ...current, camera: camera || undefined }))}
        />
        <FilterRow
          label="Lens"
          value={filters.lens}
          options={filterOptions.lens}
          onChange={(lens) => setFilters((current) => ({ ...current, lens: lens || undefined }))}
        />
        <FilterRow
          label="Trip"
          value={filters.trip}
          options={filterOptions.trip}
          onChange={(trip) => setFilters((current) => ({ ...current, trip: trip || undefined }))}
        />
        <FilterRow
          label="Year"
          value={filters.year}
          options={filterOptions.year}
          onChange={(year) => setFilters((current) => ({ ...current, year: year || undefined }))}
        />

        <div className="flex flex-wrap gap-2">
          <ToggleChip
            label="Favorites"
            active={Boolean(filters.favorite)}
            onClick={() =>
              setFilters((current) => ({ ...current, favorite: current.favorite ? undefined : true }))
            }
          />
          <ToggleChip
            label="Featured"
            active={Boolean(filters.featured)}
            onClick={() =>
              setFilters((current) => ({ ...current, featured: current.featured ? undefined : true }))
            }
          />
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            onClick={() => {
              setQuery("");
              setFilters({});
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--color-muted-foreground)]">
        {filtered.length} photo{filtered.length === 1 ? "" : "s"}
      </p>

      <PhotoMasonry photos={filtered} />
    </div>
  );
}

function FilterRow({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  if (!options.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        <Chip label="All" active={!value} onClick={() => onChange("")} />
        {options.map((option) => (
          <Chip key={option} label={option} active={value === option} onClick={() => onChange(option)} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-sm",
        active
          ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
          : "bg-[var(--color-accent-soft)] text-[var(--color-foreground)]"
      )}
    >
      {label}
    </button>
  );
}

function ToggleChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return <Chip label={label} active={active} onClick={onClick} />;
}

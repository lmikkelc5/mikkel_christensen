"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import type { Photo } from "@/lib/photo-types";
import { formatDate } from "@/lib/utils";

import { PhotoImage } from "./photo-image";

type PhotoLightboxProps = {
  photos: Photo[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number | null) => void;
};

export function PhotoLightbox({ photos, activeIndex, onClose, onChange }: PhotoLightboxProps) {
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        onChange(((activeIndex ?? 0) + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
        onChange(((activeIndex ?? 0) - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, onClose, onChange, photos.length]);

  if (!activePhoto) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/92 p-4 text-white">
      <div className="mx-auto flex h-full max-w-7xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{activePhoto.title || activePhoto.file}</p>
            <p className="text-sm text-white/70">
              {activeIndex! + 1} / {photos.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => document.documentElement.requestFullscreen?.()}
              className="rounded-full border border-white/20 px-4 py-2"
              aria-label="Fullscreen"
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-4 py-2"
              aria-label="Close lightbox"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onChange(((activeIndex ?? 0) - 1 + photos.length) % photos.length)}
            className="rounded-full border border-white/20 p-3"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <PhotoImage photo={activePhoto} variant="full" className="max-h-[72vh] w-auto object-contain" sizes="100vw" />

          <button
            type="button"
            onClick={() => onChange(((activeIndex ?? 0) + 1) % photos.length)}
            className="rounded-full border border-white/20 p-3"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-2 text-sm text-white/80">
            {activePhoto.description ? <p>{activePhoto.description}</p> : null}
            {activePhoto.location ? <p>{activePhoto.location}</p> : null}
            {activePhoto.dateTaken ? <p>{formatDate(activePhoto.dateTaken)}</p> : null}
          </div>
          <Link href={activePhoto.href} className="text-sm font-medium text-white">
            Open photo page
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

import type { GalleryGroup } from "@/lib/photo-types";

import { PhotoImage } from "./photo-image";

type GalleryCardProps = {
  href: string;
  gallery: GalleryGroup;
};

export function GalleryCard({ href, gallery }: GalleryCardProps) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-3xl border bg-[var(--color-card)]">
      <div className="aspect-[4/3] overflow-hidden bg-[var(--color-accent-soft)]">
        {gallery.cover ? (
          <PhotoImage
            photo={gallery.cover}
            className="transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold">{gallery.label}</h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {gallery.count} photo{gallery.count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

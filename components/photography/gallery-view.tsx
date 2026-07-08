import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhotoMasonry } from "@/components/photography/photo-masonry";
import { SectionHeading } from "@/components/section-heading";
import type { GalleryType } from "@/lib/photo-types";
import { getGalleryLabel, getGalleryPhotos } from "@/lib/photos";

type GalleryViewProps = {
  type: GalleryType;
  slug: string;
  eyebrow: string;
};

export function GalleryView({ type, slug, eyebrow }: GalleryViewProps) {
  const photos = getGalleryPhotos(type, slug);
  if (!photos.length) notFound();

  const label = getGalleryLabel(type, slug);

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/photography", label: "Photography" },
          { href: `/photography/${type}/${slug}`, label }
        ]}
      />
      <SectionHeading eyebrow={eyebrow} title={label} description={`${photos.length} photos`} />
      <PhotoMasonry photos={photos} />
    </div>
  );
}

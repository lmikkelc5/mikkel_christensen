import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { GalleryCard } from "@/components/photography/gallery-card";
import { PhotoLibrary } from "@/components/photography/photo-masonry";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import {
  getFavoritePhotos,
  getFeaturedPhotos,
  getFilterOptions,
  getGalleries,
  getPhotos
} from "@/lib/photos";

export default function PhotographyPage() {
  const photos = getPhotos();
  const filterOptions = getFilterOptions(photos);
  const featured = getFeaturedPhotos(4);
  const favorites = getFavoritePhotos();

  return (
    <div className="page-shell space-y-14 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Photography"
        title="A metadata-driven photo library"
        description="Every image lives once in originals. Galleries for film, trips, cameras, and years are generated automatically from photos.json."
      />

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/photography/portfolio">Featured portfolio</ButtonLink>
        <ButtonLink href="/photography/favorites" variant="secondary">
          Favorites
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {featured.length} featured photo{featured.length === 1 ? "" : "s"} in the portfolio.
          </p>
          <Link href="/photography/portfolio" className="text-sm font-medium text-[var(--color-accent)]">
            View portfolio
          </Link>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Favorites</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {favorites.length} favorite photo{favorites.length === 1 ? "" : "s"} saved in the library.
          </p>
          <Link href="/photography/favorites" className="text-sm font-medium text-[var(--color-accent)]">
            Browse favorites
          </Link>
        </Card>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Browse by film</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {getGalleries("film").map((gallery) => (
            <GalleryCard key={gallery.slug} href={`/photography/film/${gallery.slug}`} gallery={gallery} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Browse by trip</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {getGalleries("trip").map((gallery) => (
            <GalleryCard key={gallery.slug} href={`/photography/trip/${gallery.slug}`} gallery={gallery} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Browse by camera</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {getGalleries("camera").map((gallery) => (
            <GalleryCard key={gallery.slug} href={`/photography/camera/${gallery.slug}`} gallery={gallery} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Browse by year</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {getGalleries("year").map((gallery) => (
            <GalleryCard key={gallery.slug} href={`/photography/year/${gallery.slug}`} gallery={gallery} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title="Search the library" description="Filter across the entire collection without duplicating files on disk." />
        <PhotoLibrary photos={photos} filterOptions={filterOptions} />
      </section>
    </div>
  );
}

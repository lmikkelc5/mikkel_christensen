import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhotoImage } from "@/components/photography/photo-image";
import { Pagination } from "@/components/pagination";
import { TagBadge } from "@/components/ui/tag-badge";
import { getPhotoById, getPhotos, getPrevNextPhoto, getRelatedPhotos } from "@/lib/photos";
import { formatDate } from "@/lib/utils";

type PhotoPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getPhotos().map((photo) => ({ id: photo.id }));
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const photo = getPhotoById(id);
  if (!photo) notFound();

  const related = getRelatedPhotos(photo);
  const { previous, next } = getPrevNextPhoto(id);

  return (
    <div className="page-shell space-y-12 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/photography", label: "Photography" },
          { href: photo.href, label: photo.title || photo.file }
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] border">
          <PhotoImage photo={photo} variant="full" priority className="max-h-[80vh] object-contain" sizes="(max-width: 1024px) 100vw, 70vw" />
        </div>

        <aside className="space-y-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{photo.title || photo.file}</h1>
            {photo.description ? (
              <p className="mt-4 leading-7 text-[var(--color-muted-foreground)]">{photo.description}</p>
            ) : null}
          </div>

          <dl className="grid gap-4 text-sm">
            <Meta label="Camera" value={photo.camera} />
            <Meta label="Lens" value={photo.lens} />
            <Meta label="Film stock" value={photo.film} />
            <Meta label="ISO" value={photo.iso} />
            <Meta label="Aperture" value={photo.aperture} />
            <Meta label="Shutter speed" value={photo.shutterSpeed} />
            <Meta label="Focal length" value={photo.focalLength} />
            <Meta label="Date" value={photo.dateTaken ? formatDate(photo.dateTaken) : undefined} />
            <Meta label="Location" value={photo.location} />
            <Meta label="Trip" value={photo.trip} />
          </dl>

          {photo.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
          ) : null}
        </aside>
      </div>

      <Pagination
        previous={previous ? { href: previous.href, label: previous.title || previous.file } : undefined}
        next={next ? { href: next.href, label: next.title || next.file } : undefined}
      />

      {related.length ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Related photos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={item.href} className="overflow-hidden rounded-3xl border">
                <PhotoImage photo={item} className="aspect-[4/3]" />
                <div className="p-4">
                  <p className="font-medium">{item.title || item.file}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

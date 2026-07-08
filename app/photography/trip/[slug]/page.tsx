import { GalleryView } from "@/components/photography/gallery-view";
import { getGalleries } from "@/lib/photos";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGalleries("trip").map((gallery) => ({ slug: gallery.slug }));
}

export default async function TripGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  return <GalleryView type="trip" slug={slug} eyebrow="Trip" />;
}

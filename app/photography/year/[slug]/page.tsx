import { GalleryView } from "@/components/photography/gallery-view";
import { getGalleries } from "@/lib/photos";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGalleries("year").map((gallery) => ({ slug: gallery.slug }));
}

export default async function YearGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  return <GalleryView type="year" slug={slug} eyebrow="Year" />;
}

import { GalleryView } from "@/components/photography/gallery-view";
import { getGalleries } from "@/lib/photos";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGalleries("camera").map((gallery) => ({ slug: gallery.slug }));
}

export default async function CameraGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  return <GalleryView type="camera" slug={slug} eyebrow="Camera" />;
}

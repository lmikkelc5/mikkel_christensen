import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhotoMasonry } from "@/components/photography/photo-masonry";
import { SectionHeading } from "@/components/section-heading";
import { getFeaturedPhotos } from "@/lib/photos";

export default function PortfolioPage() {
  const photos = getFeaturedPhotos();

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/photography", label: "Photography" },
          { href: "/photography/portfolio", label: "Portfolio" }
        ]}
      />
      <SectionHeading
        eyebrow="Portfolio"
        title="Featured work"
        description="Every image marked featured in photos.json appears here automatically."
      />
      <PhotoMasonry photos={photos} />
    </div>
  );
}

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhotoMasonry } from "@/components/photography/photo-masonry";
import { SectionHeading } from "@/components/section-heading";
import { getFavoritePhotos } from "@/lib/photos";

export default function FavoritesPage() {
  const photos = getFavoritePhotos();

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/photography", label: "Photography" },
          { href: "/photography/favorites", label: "Favorites" }
        ]}
      />
      <SectionHeading
        eyebrow="Favorites"
        title="Saved favorites"
        description="A generated gallery of every photo marked favorite in the library."
      />
      <PhotoMasonry photos={photos} />
    </div>
  );
}

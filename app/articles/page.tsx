import { ContentSearch } from "@/components/content-search";
import { SectionHeading } from "@/components/section-heading";
import {
  getAllArticleCategories,
  getAllTags,
  getCollection
} from "@/lib/content";
import { toArticleListItems } from "@/lib/content-list";

export default function ArticlesPage() {
  const articles = getCollection("articles");
  const filters = [...getAllArticleCategories(), ...getAllTags("articles")];

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Articles"
        title="Writing about software, systems, and creative practice"
        description="Articles are managed through the admin dashboard, stored as HTML plus metadata JSON, and remain searchable by categories and tags."
      />
      <ContentSearch
        variant="articles"
        items={toArticleListItems(articles)}
        placeholder="Search articles by title, tag, or category"
        filters={filters}
        filterLabel="Categories and tags"
      />
    </div>
  );
}

import { ContentSearch } from "@/components/content-search";
import { SectionHeading } from "@/components/section-heading";
import { getAllTags, getCollection } from "@/lib/content";
import { toRecipeListItems } from "@/lib/content-list";

export default function RecipesPage() {
  const recipes = getCollection("recipes");

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Recipes"
        title="A searchable recipe collection"
        description="Recipes are stored as HTML plus metadata JSON, searchable by title and tags, and editable through the integrated admin dashboard."
      />
      <ContentSearch
        variant="recipes"
        items={toRecipeListItems(recipes)}
        placeholder="Search recipes by title, ingredient, or tag"
        filters={getAllTags("recipes")}
        filterLabel="Recipe tags"
      />
    </div>
  );
}

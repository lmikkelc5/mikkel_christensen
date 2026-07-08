import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PrintButton } from "@/components/print-button";
import { RecipeCard } from "@/components/recipe-card";
import { SectionHeading } from "@/components/section-heading";
import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/ui/tag-badge";
import {
  getCollection,
  getRecipe
} from "@/lib/content";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCollection("recipes").map((recipe) => ({
    slug: recipe.slug
  }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const related = getCollection("recipes")
    .filter((item) => item.slug !== recipe.slug)
    .slice(0, 2);

  return (
    <div className="page-shell space-y-12 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/recipes", label: "Recipes" },
          { href: recipe.href, label: recipe.frontmatter.title }
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="h-fit space-y-5">
          <div className="flex flex-wrap gap-2">
            {(recipe.frontmatter.tags ?? []).map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              {recipe.frontmatter.title}
            </h1>
            <p className="mt-4 leading-7 text-[var(--color-muted-foreground)]">
              {recipe.frontmatter.description}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Prep time" value={recipe.frontmatter.prepTime} />
            <Info label="Cook time" value={recipe.frontmatter.cookTime} />
            <Info label="Total time" value={recipe.frontmatter.totalTime} />
            <Info label="Servings" value={recipe.frontmatter.servings} />
            <Info label="Difficulty" value={recipe.frontmatter.difficulty} />
          </dl>
          {recipe.frontmatter.nutrition?.length ? (
            <div>
              <h2 className="font-semibold">Nutrition</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                {recipe.frontmatter.nutrition.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <PrintButton />
        </Card>

        <article
          className="prose-custom min-w-0"
          dangerouslySetInnerHTML={{ __html: recipe.content }}
        />
      </div>

      {related.length ? (
        <section className="space-y-6">
          <SectionHeading title="More recipes" />
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((item) => (
              <RecipeCard key={item.slug} recipe={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="text-[var(--color-muted-foreground)]">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

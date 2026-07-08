import Link from "next/link";

import type { RecipeListItem } from "@/lib/content-list";

import { Card } from "./ui/card";
import { TagBadge } from "./ui/tag-badge";

type RecipeCardProps = {
  recipe: RecipeListItem;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <TagBadge label={recipe.frontmatter.difficulty} />
          <TagBadge label={recipe.frontmatter.totalTime} />
        </div>
        <div>
          <Link href={recipe.href} className="text-xl font-semibold hover:text-[var(--color-accent)]">
            {recipe.frontmatter.title}
          </Link>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">
            {recipe.frontmatter.description}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {(recipe.frontmatter.tags ?? []).slice(0, 4).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      </div>
    </Card>
  );
}

import Link from "next/link";

import type { ArticleListItem } from "@/lib/content-list";
import { formatDate } from "@/lib/utils";

import { Card } from "./ui/card";
import { TagBadge } from "./ui/tag-badge";

type ArticleCardProps = {
  article: ArticleListItem;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
          <span>{article.frontmatter.category}</span>
          <span>{formatDate(article.frontmatter.date)}</span>
          <span>{article.readingTime}</span>
        </div>
        <div>
          <Link href={article.href} className="text-xl font-semibold hover:text-[var(--color-accent)]">
            {article.frontmatter.title}
          </Link>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">
            {article.frontmatter.description}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {(article.frontmatter.tags ?? []).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      </div>
    </Card>
  );
}

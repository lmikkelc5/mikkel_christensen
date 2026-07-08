"use client";

import { useMemo, useState } from "react";

import type { ArticleListItem, ProjectListItem, RecipeListItem } from "@/lib/content-list";
import { cn } from "@/lib/utils";

import { ArticleCard } from "./article-card";
import { ProjectCard } from "./project-card";
import { RecipeCard } from "./recipe-card";

type BaseSearchProps = {
  placeholder: string;
  filters?: string[];
  filterLabel?: string;
};

type ContentSearchProps =
  | (BaseSearchProps & { variant: "articles"; items: ArticleListItem[] })
  | (BaseSearchProps & { variant: "recipes"; items: RecipeListItem[] })
  | (BaseSearchProps & { variant: "projects"; items: ProjectListItem[] });

type SearchableFields = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  status?: string;
};

export function ContentSearch(props: ContentSearchProps) {
  const { placeholder, filters = [], filterLabel = "Filter" } = props;
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const searchableItems = useMemo(
    () => props.items.map((item) => ({ item, fields: toSearchableFields(props.variant, item) })),
    [props.items, props.variant]
  );

  const filteredItems = useMemo(() => {
    return searchableItems.filter(({ fields }) => {
      const haystack = `${fields.title} ${fields.description} ${fields.tags.join(" ")} ${
        fields.category ?? ""
      } ${fields.status ?? ""}`.toLowerCase();

      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesFilter =
        activeFilter === "All" ||
        fields.tags.includes(activeFilter) ||
        fields.category === activeFilter ||
        fields.status === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query, searchableItems]);

  return (
    <div className="space-y-6">
      <div className="surface space-y-4 p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        {filters.length ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{filterLabel}</p>
            <div className="flex flex-wrap gap-2">
              {["All", ...filters].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full px-3 py-1 text-sm",
                    activeFilter === filter
                      ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                      : "bg-[var(--color-accent-soft)] text-[var(--color-foreground)]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-sm text-[var(--color-muted-foreground)]">
        {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map(({ item }) => (
          <div key={item.slug}>
            {props.variant === "articles" ? (
              <ArticleCard article={item as ArticleListItem} />
            ) : props.variant === "recipes" ? (
              <RecipeCard recipe={item as RecipeListItem} />
            ) : (
              <ProjectCard project={item as ProjectListItem} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function toSearchableFields(
  variant: ContentSearchProps["variant"],
  item: ArticleListItem | RecipeListItem | ProjectListItem
): SearchableFields {
  if (variant === "articles") {
    const article = item as ArticleListItem;
    return {
      slug: article.slug,
      title: article.frontmatter.title,
      description: article.frontmatter.description,
      tags: article.frontmatter.tags ?? [],
      category: article.frontmatter.category
    };
  }

  if (variant === "recipes") {
    const recipe = item as RecipeListItem;
    return {
      slug: recipe.slug,
      title: recipe.frontmatter.title,
      description: recipe.frontmatter.description,
      tags: recipe.frontmatter.tags ?? []
    };
  }

  const project = item as ProjectListItem;
  return {
    slug: project.slug,
    title: project.frontmatter.title,
    description: project.frontmatter.description,
    tags: project.frontmatter.technologies,
    status: project.frontmatter.status
  };
}

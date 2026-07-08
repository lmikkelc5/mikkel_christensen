import type {
  ArticleFrontmatter,
  CollectionItem,
  ProjectFrontmatter,
  RecipeFrontmatter
} from "./content";

export type ArticleListItem = Pick<
  CollectionItem<ArticleFrontmatter>,
  "slug" | "href" | "readingTime" | "frontmatter"
>;

export type RecipeListItem = Pick<CollectionItem<RecipeFrontmatter>, "slug" | "href" | "frontmatter">;

export type ProjectListItem = Pick<
  CollectionItem<ProjectFrontmatter>,
  "slug" | "href" | "frontmatter"
>;

export function toArticleListItems(
  items: CollectionItem<ArticleFrontmatter>[]
): ArticleListItem[] {
  return items.map(({ slug, href, frontmatter, readingTime }) => ({
    slug,
    href,
    frontmatter,
    readingTime
  }));
}

export function toRecipeListItems(items: CollectionItem<RecipeFrontmatter>[]): RecipeListItem[] {
  return items.map(({ slug, href, frontmatter }) => ({
    slug,
    href,
    frontmatter
  }));
}

export function toProjectListItems(
  items: CollectionItem<ProjectFrontmatter>[]
): ProjectListItem[] {
  return items.map(({ slug, href, frontmatter }) => ({
    slug,
    href,
    frontmatter
  }));
}

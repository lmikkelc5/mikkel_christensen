import fs from "node:fs";
import path from "node:path";

import { siteConfig } from "./site-config";
import type {
  ArticleMetadata,
  CollectionMetadataMap,
  CollectionName,
  ProjectMetadata,
  RecipeMetadata
} from "./content-schema";
import {
  addHeadingIds,
  extractTocFromHtml,
  getExcerptFromHtml,
  getReadingTimeFromHtml,
  sanitizeStoredHtml
} from "./html-utils";

export type TocItem = {
  level: number;
  text: string;
  id: string;
};

export type CollectionItem<T> = {
  slug: string;
  href: string;
  frontmatter: T;
  excerpt: string;
  readingTime?: string;
  content: string;
  toc: TocItem[];
  contentFileName: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

function getCollectionDir(collection: CollectionName) {
  return path.join(CONTENT_ROOT, collection);
}

function getEntries(collection: CollectionName) {
  const dir = getCollectionDir(collection);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => fs.statSync(path.join(dir, file)).isDirectory())
    .sort();
}

function getContentFileName(collection: CollectionName) {
  if (collection === "articles") return "article.html";
  if (collection === "recipes") return "recipe.html";
  return "project.html";
}

function parseItem<T extends CollectionMetadataMap[CollectionName]>(
  collection: CollectionName,
  slug: string
): CollectionItem<T> {
  const entryDir = path.join(getCollectionDir(collection), slug);
  const metadataPath = path.join(entryDir, "metadata.json");
  const contentFileName = getContentFileName(collection);
  const contentPath = path.join(entryDir, contentFileName);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")) as T;
  const html = fs.existsSync(contentPath) ? fs.readFileSync(contentPath, "utf8") : "";
  const safeHtml = addHeadingIds(sanitizeStoredHtml(html));

  return {
    slug,
    href: `/${collection}/${slug}`,
    frontmatter: metadata,
    excerpt: getExcerptFromHtml(safeHtml, metadata.description),
    readingTime: collection === "articles" ? getReadingTimeFromHtml(safeHtml) : undefined,
    content: safeHtml,
    toc: collection === "articles" ? extractTocFromHtml(safeHtml) : [],
    contentFileName
  };
}

export function getCollection<K extends CollectionName>(collection: K) {
  return getEntries(collection)
    .map((slug) => parseItem<CollectionMetadataMap[K]>(collection, slug))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
}

export function getArticle(slug: string) {
  return getCollection("articles").find((item) => item.slug === slug);
}

export function getRecipe(slug: string) {
  return getCollection("recipes").find((item) => item.slug === slug);
}

export function getProject(slug: string) {
  return getCollection("projects").find((item) => item.slug === slug);
}

export function getRelatedArticles(slug: string, tags: string[]) {
  return getCollection("articles")
    .filter((article) => article.slug !== slug)
    .map((article) => ({
      article,
      score: article.frontmatter.tags?.filter((tag) => tags.includes(tag)).length ?? 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.article);
}

export function getPrevNextArticles(slug: string) {
  const articles = getCollection("articles");
  const index = articles.findIndex((article) => article.slug === slug);

  return {
    previous: index < articles.length - 1 ? articles[index + 1] : undefined,
    next: index > 0 ? articles[index - 1] : undefined
  };
}

export function getAllTags(collection: CollectionName) {
  return Array.from(
    new Set(getCollection(collection).flatMap((item) => item.frontmatter.tags ?? []))
  ).sort();
}

export function getAllArticleCategories() {
  return Array.from(
    new Set(getCollection("articles").map((item) => item.frontmatter.category))
  ).sort();
}

export function getRssXml() {
  const articles = getCollection("articles");

  const items = articles
    .map(
      (article) => `
        <item>
          <title><![CDATA[${article.frontmatter.title}]]></title>
          <link>${siteConfig.url}${article.href}</link>
          <guid>${siteConfig.url}${article.href}</guid>
          <pubDate>${new Date(article.frontmatter.date).toUTCString()}</pubDate>
          <description><![CDATA[${article.frontmatter.description}]]></description>
        </item>
      `
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    ${items}
  </channel>
</rss>`;
}

export type { ArticleMetadata as ArticleFrontmatter, ProjectMetadata as ProjectFrontmatter, RecipeMetadata as RecipeFrontmatter };
export type { CollectionName };

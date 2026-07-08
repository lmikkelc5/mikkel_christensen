import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination } from "@/components/pagination";
import { TableOfContents } from "@/components/table-of-contents";
import {
  getArticle,
  getCollection,
  getPrevNextArticles,
  getRelatedArticles
} from "@/lib/content";
import { formatDate } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCollection("articles").map((article) => ({
    slug: article.slug
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article.slug, article.frontmatter.tags ?? []);
  const { previous, next } = getPrevNextArticles(article.slug);

  return (
    <div className="page-shell py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/articles", label: "Articles" },
          { href: article.href, label: article.frontmatter.title }
        ]}
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <header className="space-y-5">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {article.frontmatter.category} · {formatDate(article.frontmatter.date)} ·{" "}
              {article.readingTime}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {article.frontmatter.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-[var(--color-muted-foreground)]">
              {article.frontmatter.description}
            </p>
          </header>

          <div
            className="prose-custom mt-10"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <Pagination
            previous={
              previous ? { href: previous.href, label: previous.frontmatter.title } : undefined
            }
            next={next ? { href: next.href, label: next.frontmatter.title } : undefined}
          />

          {related.length ? (
            <section className="mt-14 space-y-6">
              <h2 className="text-2xl font-semibold">Related articles</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <TableOfContents items={article.toc} />
        </div>
      </div>
    </div>
  );
}

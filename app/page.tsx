import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { PhotoImage } from "@/components/photography/photo-image";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { TagBadge } from "@/components/ui/tag-badge";
import { getCollection } from "@/lib/content";
import { getFeaturedPhotos, getRecentPhotos } from "@/lib/photos";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const articles = getCollection("articles");
  const projects = getCollection("projects");
  const recentPhotos = getRecentPhotos(6);
  const featuredPhotos = getFeaturedPhotos(3);

  const latestArticle = articles[0];
  const featuredProject = projects.find((project) => project.frontmatter.featured) ?? projects[0];

  return (
    <div className="page-shell space-y-20 py-12 sm:py-16">
      <section className="bg-grid relative overflow-hidden rounded-[2rem] border px-6 py-16 sm:px-10 sm:py-20">
        <div className="max-w-3xl space-y-8">
          <TagBadge label="Personal Hub" />
          <div className="space-y-5">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
              A clean home for thoughtful writing, software projects, favorite recipes,
              and photography collections.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/articles">Articles</ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              Projects
            </ButtonLink>
            <ButtonLink href="/recipes" variant="secondary">
              Recipes
            </ButtonLink>
            <ButtonLink href="/photography" variant="secondary">
              Photography
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Featured"
            title="Highlighted work and recent writing"
            description="The homepage automatically pulls the latest content and a featured project so the site stays fresh as you add more."
          />
          {featuredProject ? <ProjectCard project={featuredProject} /> : null}
        </div>

        {latestArticle ? (
          <Card className="h-fit">
            <p className="text-sm font-medium text-[var(--color-accent)]">Latest article</p>
            <h2 className="mt-4 text-2xl font-semibold">{latestArticle.frontmatter.title}</h2>
            <p className="mt-3 leading-7 text-[var(--color-muted-foreground)]">
              {latestArticle.frontmatter.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(latestArticle.frontmatter.tags ?? []).map((tag) => (
                <TagBadge key={tag} label={tag} />
              ))}
            </div>
            <Link href={latestArticle.href} className="mt-6 inline-block text-sm font-medium text-[var(--color-accent)]">
              Read article
            </Link>
          </Card>
        ) : null}
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Photography"
          title="Recent photos"
          description="Each image lives once on disk and appears in galleries automatically based on metadata like film stock, trip, and camera."
        />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {recentPhotos.map((photo) => (
            <Link
              key={photo.id}
              href={photo.href}
              className="overflow-hidden rounded-3xl"
            >
              <PhotoImage
                photo={photo}
                className="aspect-[4/5] h-full w-full object-cover"
              />
            </Link>
          ))}
        </div>
        {featuredPhotos.length > 0 ? (
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/photography/portfolio" variant="secondary">
              View featured portfolio
            </ButtonLink>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {featuredPhotos.length} featured photo{featuredPhotos.length === 1 ? "" : "s"} in the portfolio
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Journal"
          title="Newest articles"
          description="Long-form content is managed through the built-in admin dashboard and stored as HTML plus structured metadata."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <section className="surface flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-accent)]">Contact</p>
          <h2 className="mt-3 text-2xl font-semibold">Let’s build something thoughtful.</h2>
          <p className="mt-3 max-w-2xl text-[var(--color-muted-foreground)]">
            Reach out for collaborations, freelance work, writing opportunities, or just
            to say hello.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`mailto:${siteConfig.email}`}>Email</ButtonLink>
          <ButtonLink href={siteConfig.socialLinks.github} variant="secondary">
            GitHub
          </ButtonLink>
          <ButtonLink href={siteConfig.socialLinks.linkedin} variant="secondary">
            LinkedIn
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

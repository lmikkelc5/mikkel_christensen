import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProjectCard } from "@/components/project-card";
import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/ui/tag-badge";
import {
  getCollection,
  getProject
} from "@/lib/content";
import { formatDate } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCollection("projects").map((project) => ({
    slug: project.slug
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const related = getCollection("projects")
    .filter((item) => item.slug !== project.slug)
    .slice(0, 2);

  return (
    <div className="page-shell space-y-12 py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: project.href, label: project.frontmatter.title }
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit space-y-5">
          <div className="flex flex-wrap gap-2">
            <TagBadge label={project.frontmatter.status} />
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {formatDate(project.frontmatter.date)}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              {project.frontmatter.title}
            </h1>
            <p className="mt-4 leading-7 text-[var(--color-muted-foreground)]">
              {project.frontmatter.description}
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Technologies</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.frontmatter.technologies.map((tech) => (
                <TagBadge key={tech} label={tech} />
              ))}
            </div>
          </div>
          {project.frontmatter.github || project.frontmatter.demo ? (
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[var(--color-accent)]">
              {project.frontmatter.github ? (
                <a href={project.frontmatter.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              ) : null}
              {project.frontmatter.demo ? (
                <a href={project.frontmatter.demo} target="_blank" rel="noreferrer">
                  Live demo
                </a>
              ) : null}
            </div>
          ) : null}
          {project.frontmatter.lessons?.length ? (
            <div>
              <h2 className="font-semibold">Lessons learned</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                {project.frontmatter.lessons.map((lesson) => (
                  <li key={lesson}>{lesson}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {project.frontmatter.improvements?.length ? (
            <div>
              <h2 className="font-semibold">Future improvements</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
                {project.frontmatter.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>

        <article
          className="prose-custom min-w-0"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      </div>

      {related.length ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">More projects</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

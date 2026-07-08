import Link from "next/link";

import type { ProjectListItem } from "@/lib/content-list";
import { formatDate } from "@/lib/utils";

import { Card } from "./ui/card";
import { TagBadge } from "./ui/tag-badge";

type ProjectCardProps = {
  project: ProjectListItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <TagBadge label={project.frontmatter.status} />
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {formatDate(project.frontmatter.date)}
          </p>
        </div>
        <div>
          <Link href={project.href} className="text-xl font-semibold hover:text-[var(--color-accent)]">
            {project.frontmatter.title}
          </Link>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">
            {project.frontmatter.description}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {project.frontmatter.technologies.slice(0, 4).map((tech) => (
            <TagBadge key={tech} label={tech} />
          ))}
        </div>
      </div>
    </Card>
  );
}

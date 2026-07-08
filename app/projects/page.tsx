import { ContentSearch } from "@/components/content-search";
import { SectionHeading } from "@/components/section-heading";
import { getCollection } from "@/lib/content";
import { toProjectListItems } from "@/lib/content-list";

export default function ProjectsPage() {
  const projects = getCollection("projects");
  const statuses = ["Planned", "In Progress", "Completed"];

  return (
    <div className="page-shell space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Projects"
        title="Selected software work"
        description="A portfolio section with filtering by project status, plus room for lessons learned and future improvements on each detail page."
      />
      <ContentSearch
        variant="projects"
        items={toProjectListItems(projects)}
        placeholder="Search projects by title, technology, or status"
        filters={statuses}
        filterLabel="Project status"
      />
    </div>
  );
}

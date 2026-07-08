import { Download } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { Timeline } from "@/components/timeline";
import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/ui/tag-badge";

const timelineItems = [
  {
    title: "Independent Software Builder",
    subtitle: "Products, writing, and experiments",
    date: "2024 - Present",
    description:
      "Building apps, sharing process notes, and designing systems that stay maintainable as they grow."
  },
  {
    title: "Product Engineering",
    subtitle: "Full-stack development",
    date: "2020 - 2024",
    description:
      "Worked across front-end systems, performance, and developer experience with an emphasis on thoughtful UI."
  },
  {
    title: "Computer Science Studies",
    subtitle: "University education",
    date: "2016 - 2020",
    description:
      "Focused on software design, human-computer interaction, and shipping reliable web applications."
  }
];

const skills = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Node.js",
  "Content Design",
  "Photography Workflow",
  "Developer Experience"
];

const interests = ["Writing", "Film photography", "Travel", "Cooking", "Open source"];

export default function AboutPage() {
  return (
    <div className="page-shell space-y-14 py-12 sm:py-16">
      <SectionHeading
        eyebrow="About"
        title="A calm digital home for creative and technical work"
        description="This page combines biography, education, skills, and a lightweight timeline so the site feels personal without becoming cluttered."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Biography</h2>
          <div className="mt-4 space-y-4 text-[var(--color-muted-foreground)]">
            <p>
              I’m a software engineer and maker who enjoys building polished digital
              products, documenting ideas through writing, and collecting visual stories
              through photography.
            </p>
            <p>
              This site is designed as a long-term hub: a place to publish thoughtful
              articles, share finished and in-progress projects, organize image
              collections, and keep favorite recipes close at hand.
            </p>
          </div>
          <div className="mt-6">
            <ButtonLink href="/resume.pdf" variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Download resume
            </ButtonLink>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">Education</h2>
            <p className="mt-3 text-[var(--color-muted-foreground)]">
              B.S. in Computer Science with a focus on modern web applications, software
              architecture, and user-centered design.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <TagBadge key={skill} label={skill} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Interests</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <TagBadge key={interest} label={interest} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <SectionHeading
          eyebrow="Timeline"
          title="Selected milestones"
          description="A reusable timeline component for career highlights, education, or future site sections."
        />
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}

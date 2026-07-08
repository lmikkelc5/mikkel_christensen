import { siteConfig } from "@/lib/site-config";

import { ThemeToggle } from "./theme-toggle";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t py-10">
      <div className="page-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium">{siteConfig.name}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Copyright {new Date().getFullYear()} {siteConfig.name}. Built with Next.js.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
          <a href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={siteConfig.socialLinks.x} target="_blank" rel="noreferrer">
            X
          </a>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

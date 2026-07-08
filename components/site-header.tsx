"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-[color:color-mix(in_oklch,var(--color-background)_92%,transparent)] backdrop-blur">
      <div className="page-shell flex h-18 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.16em] uppercase">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-foreground)]",
                  active && "bg-[var(--color-accent-soft)] text-[var(--color-foreground)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t md:hidden">
          <div className="page-shell flex flex-col gap-2 py-4">
            {siteConfig.navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-foreground)]",
                    active && "bg-[var(--color-accent-soft)] text-[var(--color-foreground)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}

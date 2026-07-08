import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--color-foreground)] text-[var(--color-background)] hover:-translate-y-0.5 hover:opacity-95",
  secondary:
    "bg-[var(--color-accent-soft)] text-[var(--color-foreground)] hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-accent-soft)]"
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof variants;
  children: ReactNode;
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: keyof typeof variants;
};

const baseClass =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium";

export function Button({
  className,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary"
}: ButtonLinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={href}
        className={cn(baseClass, variants[variant], className)}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(baseClass, variants[variant], className)}>
      {children}
    </Link>
  );
}

import { cn } from "@/lib/utils";

type TagBadgeProps = {
  label: string;
  className?: string;
};

export function TagBadge({ label, className }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-foreground)]",
        className
      )}
    >
      {label}
    </span>
  );
}

import Link from "next/link";

type PaginationProps = {
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
};

export function Pagination({ previous, next }: PaginationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.href} className="surface p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Previous
          </p>
          <p className="mt-2 font-medium">{previous.label}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={next.href} className="surface p-5 text-left sm:text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Next
          </p>
          <p className="mt-2 font-medium">{next.label}</p>
        </Link>
      ) : null}
    </div>
  );
}

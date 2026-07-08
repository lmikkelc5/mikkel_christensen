import type { TocItem } from "@/lib/content";

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="surface p-5">
      <p className="text-sm font-semibold">On this page</p>
      <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted-foreground)]">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ps-4" : ""}>
            <a href={`#${item.id}`} className="hover:text-[var(--color-foreground)]">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

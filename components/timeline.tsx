type TimelineItem = {
  title: string;
  subtitle: string;
  date: string;
  description: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="relative space-y-8 border-s ps-8">
      {items.map((item) => (
        <li key={`${item.title}-${item.date}`} className="relative">
          <span className="absolute -start-[2.15rem] top-1 h-4 w-4 rounded-full bg-[var(--color-accent)]" />
          <div className="surface p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">{item.subtitle}</p>
              </div>
              <p className="text-sm text-[var(--color-muted-foreground)]">{item.date}</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

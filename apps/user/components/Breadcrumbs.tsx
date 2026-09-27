import Link from "next/link";

export function Breadcrumbs({ items, dark = true }: { items: Array<{ label: string; href?: string }>; dark?: boolean }) {
  const mutedClass = dark ? "text-white/60" : "text-ink-muted";
  const linkClass = dark ? "hover:text-accent" : "hover:text-brand-blue";
  return (
    <p className={`text-sm ${mutedClass}`}>
      <Link href="/" className={linkClass}>
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i}>
          <span className="mx-1.5">›</span>
          {item.href ? (
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}

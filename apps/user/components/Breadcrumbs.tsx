import Link from "next/link";

export function Breadcrumbs({ items, dark = true }: { items: Array<{ label: string; href?: string }>; dark?: boolean }) {
  const mutedClass = dark ? "text-white/60" : "text-slate-400";
  const linkClass = dark ? "hover:text-accent" : "hover:text-brand";
  return (
    <p className={`text-xs ${mutedClass}`}>
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

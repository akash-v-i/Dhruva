import { Link } from "@tanstack/react-router";
import { useHindi } from "@/lib/language";
import { uiText } from "@/lib/translation";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const hi = useHindi();
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
    >
      <Link to="/home" className="hover:text-primary">
        {hi ? "मुखपृष्ठ" : "Home"}
      </Link>
      {items.map((c) => (
        <span key={uiText(c.label, hi)} className="flex items-center gap-1">
          <ChevronRight className="size-3" />
          {c.to ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Link {...({ to: c.to, params: c.params } as any)} className="hover:text-primary">
              {uiText(c.label, hi)}
            </Link>
          ) : (
            <span className="text-foreground">{uiText(c.label, hi)}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import type { BreadcrumbItem } from "@/types";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {breadcrumbs && (
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Link to="/dashboard" className="hover:text-foreground transition-colors"><Home className="h-3 w-3" /></Link>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {b.href
                  ? <Link to={b.href} className="hover:text-foreground transition-colors">{b.label}</Link>
                  : <span className="text-foreground font-medium">{b.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaLabel?: string;
  positive?: boolean;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  loading?: boolean;
}

export function StatCard({ label, value, delta, deltaLabel, positive = true, icon: Icon, iconClassName = "text-primary", iconBgClassName = "bg-primary/10", loading }: StatCardProps) {
  if (loading) return <StatCardSkeleton />;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", iconBgClassName)}>
          <Icon className={cn("h-5 w-5", iconClassName)} />
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {positive
            ? <ArrowUpRight className="h-3.5 w-3.5 text-success" />
            : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
          <span className={positive ? "text-success" : "text-destructive"}>{delta}</span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mt-3 h-3 w-28 animate-pulse rounded bg-muted" />
    </div>
  );
}

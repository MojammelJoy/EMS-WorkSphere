import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary/10 text-primary ring-primary/20",
        secondary:   "bg-secondary text-secondary-foreground ring-secondary/30",
        success:     "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/30",
        warning:     "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/30",
        destructive: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-500/30",
        muted:       "bg-muted text-muted-foreground ring-muted-foreground/20",
        outline:     "bg-transparent text-foreground ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", variant === "success" && "bg-emerald-500", variant === "warning" && "bg-amber-500", variant === "destructive" && "bg-red-500", variant === "muted" && "bg-slate-400")} />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

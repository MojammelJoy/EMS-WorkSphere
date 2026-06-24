import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-muted-foreground">Showing {from}–{to} of {total} records</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground">…</span>
          ) : (
            <Button
              key={p}
              size="icon-sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange(Number(p))}
              className={cn(p === page && "pointer-events-none")}
            >
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

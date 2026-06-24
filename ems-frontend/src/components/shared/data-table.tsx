import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableColumn } from "@/types";

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
}

export function DataTable<T>({ columns, data, loading, emptyMessage = "No records found.", onRowClick, keyExtractor, sortBy, sortOrder, onSort }: DataTableProps<T>) {
  if (loading) return <TableSkeleton columns={columns.length} />;

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/40">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={col.width ? { width: col.width } : undefined}
                className={cn("px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground", col.sortable && "cursor-pointer select-none hover:text-foreground")}
                onClick={() => col.sortable && onSort?.(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-muted-foreground/50">
                      {sortBy === col.key
                        ? sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        : <ChevronsUpDown className="h-3.5 w-3.5" />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-muted/40")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-5 py-3.5 text-foreground">
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-y border-border bg-muted/40">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-5 py-3.5">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" style={{ width: `${40 + Math.random() * 40}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

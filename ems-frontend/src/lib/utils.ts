import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatNumber = (n: number) => new Intl.NumberFormat("en-BD").format(n);

export const formatDate = (date: string | Date, fmt = "dd MMM yyyy") =>
  format(new Date(date), fmt);

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "dd MMM yyyy, hh:mm a");

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const daysUntil = (date: string | Date) =>
  differenceInDays(new Date(date), new Date());

export const getInitials = (name?: string) =>
  (name ?? "").trim().split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "?";

export const truncate = (str: string, len: number) =>
  str.length > len ? str.slice(0, len) + "…" : str;

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> =>
  arr.reduce((acc, item) => {
    const k = String(item[key]);
    return { ...acc, [k]: [...(acc[k] ?? []), item] };
  }, {} as Record<string, T[]>);

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    ACTIVE: "success",  PRESENT: "success",  APPROVED: "success",  PAID: "success",
    ON_LEAVE: "warning", LATE: "warning",     PENDING: "warning",   PROCESSED: "warning",
    INACTIVE: "muted",  HALF_DAY: "muted",   CANCELLED: "muted",   DRAFT: "muted",
    TERMINATED: "destructive", ABSENT: "destructive", REJECTED: "destructive",
  };
  return map[status] ?? "muted";
};

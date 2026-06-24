import { PAGINATION } from "@/constants";
import type { PaginationQuery, PaginationMeta } from "@/types";

export function getPaginationParams(query: PaginationQuery) {
  const page  = Math.max(1, parseInt(query.page  ?? "1",  10));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit ?? "10", 10))
  );
  const skip  = (page - 1) * limit;
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";
  const sortBy = query.sortBy ?? "createdAt";

  return { page, limit, skip, sortBy, sortOrder, search: query.search ?? "" };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

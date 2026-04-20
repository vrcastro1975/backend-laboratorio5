export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const sanitizePagination = (
  page?: string,
  pageSize?: string
): PaginationParams => {
  const parsedPage = Number.parseInt(page ?? "1", 10);
  const parsedPageSize = Number.parseInt(pageSize ?? "10", 10);

  const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const safePageSize =
    Number.isNaN(parsedPageSize) || parsedPageSize < 1
      ? 10
      : Math.min(parsedPageSize, 50);

  return {
    page: safePage,
    pageSize: safePageSize,
  };
};

export const paginate = <T>(
  items: T[],
  pagination: PaginationParams
): Paginated<T> => {
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  return {
    data: items.slice(start, end),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
};

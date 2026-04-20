import { describe, expect, it } from "vitest";
import { paginate, sanitizePagination } from "./pagination.helper";

describe("sanitizePagination", () => {
  it("should return defaults when values are invalid", () => {
    const result = sanitizePagination("-1", "foo");
    expect(result).toEqual({ page: 1, pageSize: 10 });
  });

  it("should cap pageSize to 50", () => {
    const result = sanitizePagination("2", "500");
    expect(result).toEqual({ page: 2, pageSize: 50 });
  });
});

describe("paginate", () => {
  it("should return the expected page data and metadata", () => {
    const result = paginate([1, 2, 3, 4, 5], {
      page: 2,
      pageSize: 2,
    });

    expect(result.data).toEqual([3, 4]);
    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 2,
      total: 5,
      totalPages: 3,
    });
  });
});

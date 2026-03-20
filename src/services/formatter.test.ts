import { describe, it, expect } from "vitest";
import { formatResponse, formatPaginationHint, formatDate, formatFileSize } from "./formatter.js";
import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";
import type { PaginationInfo } from "./api-client.js";

describe("formatResponse", () => {
  const markdownFn = (d: unknown) => `# Result\n${JSON.stringify(d)}`;

  it("returns markdown when format is MARKDOWN", () => {
    const result = formatResponse({ foo: 1 }, ResponseFormat.MARKDOWN, markdownFn);
    expect(result).toBe('# Result\n{"foo":1}');
  });

  it("returns JSON when format is JSON", () => {
    const result = formatResponse({ foo: 1 }, ResponseFormat.JSON, markdownFn);
    expect(result).toBe(JSON.stringify({ foo: 1 }, null, 2));
  });

  it("truncates responses exceeding CHARACTER_LIMIT", () => {
    const bigData = "x".repeat(CHARACTER_LIMIT + 1000);
    const result = formatResponse(
      bigData,
      ResponseFormat.MARKDOWN,
      () => bigData
    );
    expect(result).toContain("Response truncated");
    expect(result.length).toBeLessThan(bigData.length);
  });

  it("does not truncate responses within CHARACTER_LIMIT", () => {
    const smallData = "x".repeat(100);
    const result = formatResponse(
      smallData,
      ResponseFormat.MARKDOWN,
      () => smallData
    );
    expect(result).toBe(smallData);
    expect(result).not.toContain("truncated");
  });
});

describe("formatDate", () => {
  it("formats valid ISO dates", () => {
    const result = formatDate("2024-06-15T12:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("returns N/A for null", () => {
    expect(formatDate(null)).toBe("N/A");
  });

  it("returns N/A for undefined", () => {
    expect(formatDate(undefined)).toBe("N/A");
  });

  it("returns N/A for empty string", () => {
    expect(formatDate("")).toBe("N/A");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe("2.50 GB");
  });

  it("returns N/A for null", () => {
    expect(formatFileSize(null)).toBe("N/A");
  });

  it("returns N/A for undefined", () => {
    expect(formatFileSize(undefined)).toBe("N/A");
  });

  it("handles zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });
});

describe("formatPaginationHint", () => {
  it("shows page X of Y with count and next hint", () => {
    const info: PaginationInfo = { current: 2, pages: 5, count: 100, per_page: 20, has_next: true };
    const result = formatPaginationHint(info);
    expect(result).toContain("Page 2 of 5");
    expect(result).toContain("100 total items");
    expect(result).toContain("use page 3 for more");
  });

  it("shows page without total when pages/count unknown", () => {
    const info: PaginationInfo = { current: 1, pages: null, count: null, per_page: 50, has_next: false };
    const result = formatPaginationHint(info);
    expect(result).toContain("Page 1");
    expect(result).not.toContain("total items");
    expect(result).not.toContain("use page");
  });

  it("shows next page hint when has_next is true", () => {
    const info: PaginationInfo = { current: 3, pages: null, count: null, per_page: 50, has_next: true };
    const result = formatPaginationHint(info);
    expect(result).toContain("use page 4 for more");
  });

  it("shows page count without next when on last page", () => {
    const info: PaginationInfo = { current: 5, pages: 5, count: 100, per_page: 20, has_next: false };
    const result = formatPaginationHint(info);
    expect(result).toContain("Page 5 of 5");
    expect(result).not.toContain("use page");
  });
});

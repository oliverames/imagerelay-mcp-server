import { describe, it, expect } from "vitest";
import { formatResponse, formatDate, formatFileSize } from "./formatter.js";
import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";

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

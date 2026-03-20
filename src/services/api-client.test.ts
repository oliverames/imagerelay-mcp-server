import { describe, it, expect, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { handleApiError, resetClient } from "./api-client.js";

describe("handleApiError", () => {
  beforeEach(() => {
    resetClient();
  });

  function makeAxiosError(status: number, data?: unknown): AxiosError {
    const error = new AxiosError(
      `Request failed with status ${status}`,
      String(status),
      undefined,
      undefined,
      {
        status,
        data: data ?? "",
        statusText: "Error",
        headers: {},
        config: {} as never,
      }
    );
    return error;
  }

  it("returns auth error for 401", () => {
    const result = handleApiError(makeAxiosError(401));
    expect(result).toContain("unauthorized");
    expect(result).toContain("IMAGERELAY_API_KEY");
  });

  it("returns forbidden error for 403", () => {
    const result = handleApiError(makeAxiosError(403));
    expect(result).toContain("Forbidden");
    expect(result).toContain("User-Agent");
  });

  it("returns not found for 404", () => {
    const result = handleApiError(makeAxiosError(404));
    expect(result).toContain("not found");
  });

  it("returns rate limit for 429", () => {
    const result = handleApiError(makeAxiosError(429));
    expect(result).toContain("Rate limit");
    expect(result).toContain("5 req/sec");
  });

  it("returns heavy load for 502", () => {
    const result = handleApiError(makeAxiosError(502));
    expect(result).toContain("heavy load");
  });

  it("returns generic status for unknown codes", () => {
    const result = handleApiError(makeAxiosError(500, "Internal Server Error"));
    expect(result).toContain("500");
    expect(result).toContain("Internal Server Error");
  });

  it("handles timeout errors", () => {
    const error = new AxiosError("timeout", "ECONNABORTED");
    const result = handleApiError(error);
    expect(result).toContain("timed out");
  });

  it("handles DNS errors", () => {
    const error = new AxiosError("DNS", "ENOTFOUND");
    const result = handleApiError(error);
    expect(result).toContain("Could not connect");
  });

  it("handles generic Error instances", () => {
    const result = handleApiError(new Error("something broke"));
    expect(result).toBe("Error: something broke");
  });

  it("handles non-Error values", () => {
    const result = handleApiError("string error");
    expect(result).toBe("Error: Unexpected error: string error");
  });
});

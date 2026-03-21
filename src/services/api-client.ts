import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, type AxiosInstance } from "axios";
import { USER_AGENT, DEFAULT_PAGE_SIZE } from "../constants.js";

let client: AxiosInstance | null = null;

function getConfig(): { baseUrl: string; apiKey: string } {
  const apiKey = process.env.IMAGERELAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "IMAGERELAY_API_KEY environment variable is required. " +
        "Generate one in Image Relay: My Account > API Keys."
    );
  }

  const subdomain = process.env.IMAGERELAY_SUBDOMAIN;
  const baseUrl = subdomain
    ? `https://${subdomain}.imagerelay.com/api/v2`
    : "https://api.imagerelay.com/api/v2";

  return { baseUrl, apiKey };
}

function getClient(): AxiosInstance {
  if (client) return client;

  const { baseUrl, apiKey } = getConfig();

  client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": USER_AGENT,
    },
  });

  return client;
}

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY_MS = 30_000;
const RETRY_STATUS_CODES = new Set([429, 502, 503]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(error: AxiosError, attempt: number): number {
  const retryAfter = error.response?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!isNaN(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
    }
  }
  return Math.pow(2, attempt) * 500;
}

function logApiError(method: string, endpoint: string, error: AxiosError): void {
  const status = error.response?.status ?? "no response";
  console.error(`[imagerelay-mcp] ${method} ${endpoint} failed: ${status}`);
}

/**
 * Shared retry wrapper for HTTP requests.
 * Retries on 429/502/503 with exponential backoff or Retry-After header.
 */
async function requestWithRetry<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await getClient().request<T>(config);
    } catch (error) {
      lastError = error;

      if (
        error instanceof AxiosError &&
        error.response &&
        RETRY_STATUS_CODES.has(error.response.status) &&
        attempt < MAX_RETRIES - 1
      ) {
        const backoff = getRetryDelay(error, attempt);
        logApiError(config.method ?? "GET", config.url ?? "", error);
        console.error(`[imagerelay-mcp] Retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await delay(backoff);
        continue;
      }

      if (error instanceof AxiosError) {
        logApiError(config.method ?? "GET", config.url ?? "", error);
      }

      throw error;
    }
  }

  throw lastError;
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await requestWithRetry<T>({
    url: endpoint,
    method,
    data,
    params,
  });
  return response.data;
}

export interface PaginationInfo {
  current: number;
  pages: number | null;
  count: number | null;
  per_page: number | null;
  has_next: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

function parseLinkHeader(linkHeader: string | undefined): { hasNext: boolean; pages: number | null } {
  if (!linkHeader) return { hasNext: false, pages: null };

  const hasNext = linkHeader.includes('rel="next"');
  let pages: number | null = null;

  const lastMatch = linkHeader.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  if (lastMatch) {
    pages = parseInt(lastMatch[1], 10);
  }

  return { hasNext, pages };
}

export async function apiListRequest<T>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<PaginatedResult<T>> {
  const currentPage = (params.page as number) || 1;
  const queryParams = { per_page: DEFAULT_PAGE_SIZE, ...params };

  const response = await requestWithRetry({
    url: endpoint,
    method: "GET",
    params: queryParams,
  });

  const body = response.data;

  // Technique #1: response body is an object with a "pagination" key
  if (body && typeof body === "object" && !Array.isArray(body) && "pagination" in body) {
    const paginationObj = (body as Record<string, unknown>).pagination as Record<string, unknown>;
    const dataKey = Object.keys(body as Record<string, unknown>).find(
      (k) => k !== "pagination" && Array.isArray((body as Record<string, unknown>)[k])
    );
    const items: T[] = dataKey ? ((body as Record<string, unknown>)[dataKey] as T[]) : [];

    return {
      data: items,
      pagination: {
        current: (paginationObj.current as number) ?? currentPage,
        pages: (paginationObj.pages as number) ?? null,
        count: (paginationObj.count as number) ?? null,
        per_page: (paginationObj.per_page as number) ?? null,
        has_next: paginationObj.next != null,
      },
    };
  }

  // Technique #2: response body is an array, pagination in Link header
  const items: T[] = Array.isArray(body) ? body : [];
  const linkHeader = response.headers?.["link"] as string | undefined;
  const linkInfo = parseLinkHeader(linkHeader);

  return {
    data: items,
    pagination: {
      current: currentPage,
      pages: linkInfo.pages,
      count: null,
      per_page: DEFAULT_PAGE_SIZE,
      has_next: linkInfo.hasNext || items.length >= DEFAULT_PAGE_SIZE,
    },
  };
}

/** Reset the cached client (for testing). */
export function resetClient(): void {
  client = null;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const body =
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data);

      switch (status) {
        case 401:
          return "Error: Invalid or unauthorized API key. Verify your IMAGERELAY_API_KEY is valid and the user has API access.";
        case 403:
          return "Error: Forbidden. Ensure the User-Agent header is set and your account has permission for this action.";
        case 404:
          return "Error: Resource not found. Check that the ID is correct.";
        case 429:
          return "Error: Rate limit exceeded (max 5 req/sec). Wait a moment and try again.";
        case 502:
        case 503:
          return "Error: Server under heavy load. Reduce request frequency and try again.";
        default:
          return `Error: API returned ${status}. ${body}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Try again.";
    } else if (error.code === "ENOTFOUND") {
      return "Error: Could not connect to Image Relay API. Check IMAGERELAY_SUBDOMAIN if set.";
    }
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Error: Unexpected error: ${String(error)}`;
}

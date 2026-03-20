import axios, { AxiosError, type AxiosInstance } from "axios";
import { USER_AGENT } from "../constants.js";

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
const RETRY_STATUS_CODES = new Set([429, 502, 503]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await getClient().request<T>({
        url: endpoint,
        method,
        data,
        params,
      });
      return response.data;
    } catch (error) {
      lastError = error;

      if (
        error instanceof AxiosError &&
        error.response &&
        RETRY_STATUS_CODES.has(error.response.status) &&
        attempt < MAX_RETRIES - 1
      ) {
        const backoff = Math.pow(2, attempt) * 500;
        await delay(backoff);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
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
          return "Error: Server under heavy load. Reduce request frequency.";
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

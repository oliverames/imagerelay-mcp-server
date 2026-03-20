import { CHARACTER_LIMIT, ResponseFormat } from "../constants.js";
import type { PaginationInfo } from "./api-client.js";

export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  markdownFn: (data: unknown) => string
): string {
  const text =
    format === ResponseFormat.MARKDOWN
      ? markdownFn(data)
      : JSON.stringify(data, null, 2);

  if (text.length > CHARACTER_LIMIT) {
    return (
      text.slice(0, CHARACTER_LIMIT) +
      "\n\n---\n*Response truncated. Use pagination or filters to see more results.*"
    );
  }

  return text;
}

export function formatPaginationHint(pagination: PaginationInfo): string {
  const parts: string[] = [];

  if (pagination.pages != null) {
    parts.push(`Page ${pagination.current} of ${pagination.pages}`);
  } else {
    parts.push(`Page ${pagination.current}`);
  }

  if (pagination.count != null) {
    parts.push(`${pagination.count} total items`);
  }

  if (pagination.has_next) {
    parts.push(`use page ${pagination.current + 1} for more`);
  }

  return parts.length > 0 ? `\n\n---\n*${parts.join(" · ")}*` : "";
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

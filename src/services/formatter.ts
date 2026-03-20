import { CHARACTER_LIMIT, ResponseFormat } from "../constants.js";

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

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface QuickLink {
  id: number;
  uid: string;
  purpose: string;
  processing: boolean;
  created_at: string;
  updated_at: string;
  asset_id: number;
  user_id: number;
  url: string;
  [key: string]: unknown;
}

function formatQuickLink(ql: QuickLink): string {
  const lines = [`## Quick Link ${ql.id}`];
  if (ql.url) lines.push(`- **URL**: ${ql.url}`);
  lines.push(`- **Asset ID**: ${ql.asset_id}`);
  lines.push(`- **Purpose**: ${ql.purpose || "download"}`);
  lines.push(`- **Processing**: ${ql.processing}`);
  lines.push(`- **Created**: ${formatDate(ql.created_at)}`);
  return lines.join("\n");
}

export function registerQuickLinkTools(server: McpServer): void {
  server.registerTool(
    "ir_get_quick_links",
    {
      title: "List Quick Links",
      description: "List all quick links (download/share links) in the account.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<QuickLink>("quick_links.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const links = d as QuickLink[];
          if (!links.length) return "No quick links found.";
          return [`# Quick Links (Page ${params.page})`, "", ...links.map((ql) => formatQuickLink(ql) + "\n")].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_user_quick_links",
    {
      title: "Get User's Quick Links",
      description: "List all quick links belonging to a specific user.",
      inputSchema: {
        user_id: z.number().int().describe("The user ID whose quick links to retrieve"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { user_id: number; page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<QuickLink>(`users/${params.user_id}/quick_links.json`, { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const links = d as QuickLink[];
          if (!links.length) return "No quick links found for this user.";
          return [`# Quick Links for User ${params.user_id} (Page ${params.page})`, "", ...links.map((ql) => formatQuickLink(ql) + "\n")].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_quick_link",
    {
      title: "Get Quick Link",
      description: "Get details for a specific quick link.",
      inputSchema: {
        quick_link_id: z.number().int().describe("The quick link ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { quick_link_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<QuickLink>(`quick_links/${params.quick_link_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => formatQuickLink(d as QuickLink));
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_quick_link",
    {
      title: "Create Quick Link",
      description:
        "Create a download/share link for a file (asset). Supports optional image transformations like resizing, format conversion, and DPI adjustment.",
      inputSchema: {
        asset_id: z.number().int().describe("The file/asset ID to create a link for"),
        purpose: z.string().describe("Purpose/intent for the quick link"),
        expires: z.string().optional().describe("Expiration date (YYYY-MM-DD)"),
        max_width: z.number().int().optional().describe("Max image width in pixels (downsizing only)"),
        max_height: z.number().int().optional().describe("Max image height in pixels (downsizing only)"),
        format: z.string().optional().describe("Output format: 'png' or 'jpg'"),
        dpi: z.number().int().optional().describe("Desired resolution in dots per inch"),
        disposition: z.string().optional().describe("'inline' (embed in webpage) or 'attachment' (download)"),
        color_format: z.string().optional().describe("Color space: 'rgb' or 'cmyk'"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      asset_id: number;
      purpose: string;
      expires?: string;
      max_width?: number;
      max_height?: number;
      format?: string;
      dpi?: number;
      disposition?: string;
      color_format?: string;
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = { asset_id: params.asset_id, purpose: params.purpose };
        if (params.expires) body.expires = params.expires;
        if (params.max_width) body.max_width = params.max_width;
        if (params.max_height) body.max_height = params.max_height;
        if (params.format) body.format = params.format;
        if (params.dpi) body.dpi = params.dpi;
        if (params.disposition) body.disposition = params.disposition;
        if (params.color_format) body.color_format = params.color_format;
        const data = await apiRequest<QuickLink>("quick_links.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# Quick Link Created\n\n${formatQuickLink(d as QuickLink)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_quick_link",
    {
      title: "Delete Quick Link",
      description: "Delete a quick link. The file is not affected.",
      inputSchema: { quick_link_id: z.number().int().describe("The quick link ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { quick_link_id: number }) => {
      try {
        await apiRequest(`quick_links/${params.quick_link_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Quick link ${params.quick_link_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

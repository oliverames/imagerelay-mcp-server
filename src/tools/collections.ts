import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface Collection {
  id: number;
  name: string;
  created_on: string;
  updated_on: string;
  user_id: number;
  [key: string]: unknown;
}

function formatCollection(c: Collection): string {
  const lines = [`## ${c.name} (ID: ${c.id})`];
  lines.push(`- **Created**: ${formatDate(c.created_on)}`);
  lines.push(`- **Updated**: ${formatDate(c.updated_on)}`);
  lines.push(`- **User ID**: ${c.user_id}`);
  return lines.join("\n");
}

export function registerCollectionTools(server: McpServer): void {
  server.registerTool(
    "ir_get_collections",
    {
      title: "List Collections",
      description: "List all collections in the Image Relay account.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<Collection>("collections.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const cols = d as Collection[];
          if (!cols.length) return "No collections found.";
          return [`# Collections (Page ${params.page})`, "", ...cols.map((c) => formatCollection(c) + "\n")].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_collection",
    {
      title: "Get Collection",
      description: "Get details for a specific collection by ID.",
      inputSchema: {
        collection_id: z.number().int().describe("The collection ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { collection_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Collection>(`collections/${params.collection_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => formatCollection(d as Collection));
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_collection_files",
    {
      title: "Get Collection Files",
      description: "List files in a specific collection.",
      inputSchema: {
        collection_id: z.number().int().describe("The collection ID"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { collection_id: number; page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<{ id: number; name: string; [key: string]: unknown }>(
          `collections/${params.collection_id}/files.json`,
          { page: params.page }
        );
        const text = formatResponse(result.data, params.response_format, (d) => {
          const files = d as { id: number; name: string; [key: string]: unknown }[];
          if (!files.length) return "No files in this collection.";
          return [`# Collection ${params.collection_id} Files (Page ${params.page})`, "", ...files.map((f) => `- **${f.name}** (ID: ${f.id})`)].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_collection",
    {
      title: "Create Collection",
      description: "Create a new collection, optionally with initial file/asset IDs.",
      inputSchema: {
        name: z.string().min(1).describe("Name for the new collection"),
        asset_ids: z.string().optional().describe("Comma-separated list of file/asset IDs to add"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; asset_ids?: string; response_format: ResponseFormat }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.asset_ids) body.asset_ids = params.asset_ids;
        const data = await apiRequest<Collection>("collections.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# Collection Created\n\n${formatCollection(d as Collection)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_collection",
    {
      title: "Update Collection",
      description: "Update a collection's name and/or add files to it.",
      inputSchema: {
        collection_id: z.number().int().describe("The collection ID to update"),
        name: z.string().min(1).describe("New name for the collection"),
        asset_ids: z.string().optional().describe("Comma-separated list of file/asset IDs to add to the collection"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { collection_id: number; name: string; asset_ids?: string; response_format: ResponseFormat }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.asset_ids) body.asset_ids = params.asset_ids;
        const data = await apiRequest<Collection>(`collections/${params.collection_id}.json`, "PUT", body);
        const text = formatResponse(data, params.response_format, (d) => `# Collection Updated\n\n${formatCollection(d as Collection)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_collection",
    {
      title: "Delete Collection",
      description: "Delete a collection. Files in the collection are not deleted.",
      inputSchema: { collection_id: z.number().int().describe("The collection ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { collection_id: number }) => {
      try {
        await apiRequest(`collections/${params.collection_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Collection ${params.collection_id} deleted successfully.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

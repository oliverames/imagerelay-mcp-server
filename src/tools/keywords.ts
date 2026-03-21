import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface KeywordSet {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Keyword {
  id: number;
  name: string;
  keyword_set_id: number;
  [key: string]: unknown;
}

export function registerKeywordTools(server: McpServer): void {
  server.registerTool(
    "ir_get_keyword_sets",
    {
      title: "List Keyword Sets (Tag Sets)",
      description: "List all keyword sets (tag sets). These group related keywords/tags.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<KeywordSet>("keyword_sets.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const sets = d as KeywordSet[];
          if (!sets.length) return "No keyword sets found.";
          return [`# Keyword Sets (Page ${params.page})`, "", ...sets.map((s) => `- **${s.name}** (ID: ${s.id})`)].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_keywords",
    {
      title: "List Keywords in Set",
      description: "List all keywords (tags) within a keyword set.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<Keyword>(
          `keyword_sets/${params.keyword_set_id}/keywords.json`,
          { page: params.page }
        );
        const text = formatResponse(result.data, params.response_format, (d) => {
          const kws = d as Keyword[];
          if (!kws.length) return "No keywords in this set.";
          return [`# Keywords in Set ${params.keyword_set_id} (Page ${params.page})`, "", ...kws.map((k) => `- **${k.name}** (ID: ${k.id})`)].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_keyword_set",
    {
      title: "Get Keyword Set",
      description: "Get details for a specific keyword set by ID.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<KeywordSet>(`keyword_sets/${params.keyword_set_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const s = d as KeywordSet;
          return `# Keyword Set\n\n- **${s.name}** (ID: ${s.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_keyword",
    {
      title: "Get Keyword",
      description: "Get details for a specific keyword by ID.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID"),
        keyword_id: z.number().int().describe("The keyword ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; keyword_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Keyword>(`keyword_sets/${params.keyword_set_id}/keywords/${params.keyword_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const k = d as Keyword;
          return `# Keyword\n\n- **${k.name}** (ID: ${k.id}) in Set ${k.keyword_set_id}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_keyword_set",
    {
      title: "Create Keyword Set",
      description: "Create a new keyword set (tag set).",
      inputSchema: {
        name: z.string().min(1).describe("Name for the keyword set"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<KeywordSet>("keyword_sets.json", "POST", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const s = d as KeywordSet;
          return `# Keyword Set Created\n\n- **${s.name}** (ID: ${s.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_keyword",
    {
      title: "Create Keyword (Tag)",
      description: "Create a new keyword (tag) within a keyword set.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID to add the keyword to"),
        name: z.string().min(1).describe("Name for the new keyword"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Keyword>(
          `keyword_sets/${params.keyword_set_id}/keywords.json`,
          "POST",
          { name: params.name }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const k = d as Keyword;
          return `# Keyword Created\n\n- **${k.name}** (ID: ${k.id}) in Set ${k.keyword_set_id}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_keyword_set",
    {
      title: "Update Keyword Set",
      description: "Update a keyword set's name.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID to update"),
        name: z.string().min(1).describe("New name for the keyword set"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<KeywordSet>(`keyword_sets/${params.keyword_set_id}.json`, "PUT", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const s = d as KeywordSet;
          return `# Keyword Set Updated\n\n- **${s.name}** (ID: ${s.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_keyword",
    {
      title: "Update Keyword",
      description: "Update a keyword's name.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID"),
        keyword_id: z.number().int().describe("The keyword ID to update"),
        name: z.string().min(1).describe("New name for the keyword"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; keyword_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Keyword>(
          `keyword_sets/${params.keyword_set_id}/keywords/${params.keyword_id}.json`,
          "PUT",
          { name: params.name }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const k = d as Keyword;
          return `# Keyword Updated\n\n- **${k.name}** (ID: ${k.id}) in Set ${k.keyword_set_id}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_keyword",
    {
      title: "Delete Keyword",
      description: "Delete a keyword (tag) from a keyword set.",
      inputSchema: {
        keyword_set_id: z.number().int().describe("The keyword set ID"),
        keyword_id: z.number().int().describe("The keyword ID to delete"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { keyword_set_id: number; keyword_id: number }) => {
      try {
        await apiRequest(`keyword_sets/${params.keyword_set_id}/keywords/${params.keyword_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Keyword ${params.keyword_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

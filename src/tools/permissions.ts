import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface Permission {
  id: number;
  name: string;
  [key: string]: unknown;
}

export function registerPermissionTools(server: McpServer): void {
  server.registerTool(
    "ir_get_permissions",
    {
      title: "List Permissions",
      description: "List all permission groups.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<Permission>("permissions.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const perms = d as Permission[];
          if (!perms.length) return "No permissions found.";
          return [`# Permissions (Page ${params.page})`, "", ...perms.map((p) => `- **${p.name}** (ID: ${p.id})`)].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_permission",
    {
      title: "Get Permission",
      description: "Get details for a specific permission group.",
      inputSchema: {
        permission_id: z.number().int().describe("The permission group ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { permission_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Permission>(`permissions/${params.permission_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const p = d as Permission;
          return `# Permission Group\n\n- **${p.name}** (ID: ${p.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_user_permission",
    {
      title: "Update User's Permission Group",
      description: "Change a user's permission group.",
      inputSchema: {
        user_id: z.number().int().describe("The user ID"),
        permission_id: z.number().int().describe("The new permission group ID"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { user_id: number; permission_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(
          `users/${params.user_id}.json`,
          "PUT",
          { role_id: params.permission_id }
        );
        const text = formatResponse(data, params.response_format, () =>
          `# Permission Updated\n\nUser ${params.user_id} assigned to permission group ${params.permission_id}.`
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

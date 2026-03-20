import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface User {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  created_on: string;
  updated_on: string;
  permission_id: number;
  custom_field_one?: string;
  custom_field_two?: string;
  custom_field_three?: string;
  custom_field_four?: string;
  [key: string]: unknown;
}

function formatUser(u: User): string {
  const lines = [`## ${u.first_name} ${u.last_name} (ID: ${u.id})`];
  lines.push(`- **Email**: ${u.email}`);
  lines.push(`- **Login**: ${u.login}`);
  if (u.company) lines.push(`- **Company**: ${u.company}`);
  lines.push(`- **Permission ID**: ${u.permission_id}`);
  lines.push(`- **Created**: ${formatDate(u.created_on)}`);
  return lines.join("\n");
}

export function registerUserTools(server: McpServer): void {
  server.registerTool(
    "ir_get_me",
    {
      title: "Get Authenticated User",
      description:
        "Get the currently authenticated Image Relay user's profile information.",
      inputSchema: { ...IdParamSchema },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<User>("users/me.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const u = d as User;
          return `# Authenticated User\n\n${formatUser(u)}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }],
        };
      }
    }
  );

  server.registerTool(
    "ir_get_users",
    {
      title: "List Users",
      description:
        "List all users in the Image Relay account. Returns paginated results.",
      inputSchema: { ...PaginationSchema },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<User>("users.json", {
          page: params.page,
        });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const users = d as User[];
          if (!users.length) return "No users found.";
          const lines = [`# Users (Page ${params.page})`, ""];
          for (const u of users) {
            lines.push(formatUser(u));
            lines.push("");
          }
          return lines.join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }],
        };
      }
    }
  );

  server.registerTool(
    "ir_get_user",
    {
      title: "Get User",
      description: "Get a specific Image Relay user by their ID.",
      inputSchema: {
        user_id: z.number().int().describe("The user ID to retrieve"),
        ...IdParamSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: { user_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<User>(`users/${params.user_id}.json`);
        const text = formatResponse(data, params.response_format, (d) =>
          formatUser(d as User)
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }],
        };
      }
    }
  );

  server.registerTool(
    "ir_search_users",
    {
      title: "Search Users",
      description:
        "Search for Image Relay users by first name, last name, or email.",
      inputSchema: {
        first_name: z
          .string()
          .optional()
          .describe("Filter by first name"),
        last_name: z
          .string()
          .optional()
          .describe("Filter by last name"),
        email: z
          .string()
          .optional()
          .describe("Filter by email address"),
        ...IdParamSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: {
      first_name?: string;
      last_name?: string;
      email?: string;
      response_format: ResponseFormat;
    }) => {
      try {
        const queryParams: Record<string, string> = {};
        if (params.first_name) queryParams.first_name = params.first_name;
        if (params.last_name) queryParams.last_name = params.last_name;
        if (params.email) queryParams.email = params.email;

        const data = await apiRequest<User[]>(
          "users/search.json",
          "GET",
          undefined,
          queryParams
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const users = d as User[];
          if (!users.length) return "No users found matching the search criteria.";
          const lines = [`# Search Results (${users.length} users)`, ""];
          for (const u of users) {
            lines.push(formatUser(u));
            lines.push("");
          }
          return lines.join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }],
        };
      }
    }
  );
}

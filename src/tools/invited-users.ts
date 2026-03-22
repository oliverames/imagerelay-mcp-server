import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface InvitedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  permission_id: number;
  created_on: string;
  [key: string]: unknown;
}

function formatInvitedUser(u: InvitedUser): string {
  const lines = [`## ${u.first_name} ${u.last_name} (ID: ${u.id})`];
  lines.push(`- **Email**: ${u.email}`);
  if (u.company) lines.push(`- **Company**: ${u.company}`);
  lines.push(`- **Permission ID**: ${u.permission_id}`);
  lines.push(`- **Created**: ${formatDate(u.created_on)}`);
  return lines.join("\n");
}

export function registerInvitedUserTools(server: McpServer): void {
  server.registerTool(
    "ir_get_invited_users",
    {
      title: "List Invited Users",
      description: "List all invited (pending) users.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<InvitedUser>("invited_users.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const users = d as InvitedUser[];
          if (!users.length) return "No invited users found.";
          return [`# Invited Users (Page ${params.page})`, "", ...users.map((u) => formatInvitedUser(u) + "\n")].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_invited_user",
    {
      title: "Get Invited User",
      description: "Get details for a specific invited user.",
      inputSchema: {
        invited_user_id: z.number().int().describe("The invited user ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { invited_user_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<InvitedUser>(`invited_users/${params.invited_user_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => formatInvitedUser(d as InvitedUser));
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_invite_user",
    {
      title: "Invite New User",
      description: "Invite a new user to the Image Relay account.",
      inputSchema: {
        first_name: z.string().min(1).describe("First name"),
        last_name: z.string().min(1).describe("Last name"),
        email: z.string().email().describe("Email address"),
        company: z.string().optional().describe("Company name"),
        permission_id: z.number().int().describe("Permission group ID to assign"),
        custom_field_one: z.string().optional().describe("Custom field 1 value"),
        custom_field_two: z.string().optional().describe("Custom field 2 value"),
        custom_field_three: z.string().optional().describe("Custom field 3 value"),
        custom_field_four: z.string().optional().describe("Custom field 4 value"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      first_name: string;
      last_name: string;
      email: string;
      company?: string;
      permission_id: number;
      custom_field_one?: string;
      custom_field_two?: string;
      custom_field_three?: string;
      custom_field_four?: string;
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {
          first_name: params.first_name,
          last_name: params.last_name,
          email: params.email,
          permission_id: params.permission_id,
        };
        if (params.company) body.company = params.company;
        if (params.custom_field_one) body.custom_field_one = params.custom_field_one;
        if (params.custom_field_two) body.custom_field_two = params.custom_field_two;
        if (params.custom_field_three) body.custom_field_three = params.custom_field_three;
        if (params.custom_field_four) body.custom_field_four = params.custom_field_four;

        const data = await apiRequest<InvitedUser>("invited_users.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# User Invited\n\n${formatInvitedUser(d as InvitedUser)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_invited_user",
    {
      title: "Delete Invited User",
      description: "Delete/cancel a pending user invitation.",
      inputSchema: { invited_user_id: z.number().int().describe("The invited user ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { invited_user_id: number }) => {
      try {
        await apiRequest(`invited_users/${params.invited_user_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Invited user ${params.invited_user_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_sso_user",
    {
      title: "Create SSO User",
      description: "Create a user via SSO (Single Sign-On).",
      inputSchema: {
        first_name: z.string().min(1).describe("First name"),
        last_name: z.string().min(1).describe("Last name"),
        email: z.string().email().describe("Email address"),
        company: z.string().optional().describe("Company name"),
        permission_id: z.number().int().describe("Permission group ID to assign"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      first_name: string;
      last_name: string;
      email: string;
      company?: string;
      permission_id: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {
          first_name: params.first_name,
          last_name: params.last_name,
          email: params.email,
          role_id: String(params.permission_id),
        };
        if (params.company) body.company = params.company;

        const data = await apiRequest<InvitedUser>("users/sso_user.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# SSO User Created\n\n${formatInvitedUser(d as InvitedUser)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

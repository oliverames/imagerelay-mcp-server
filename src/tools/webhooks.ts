import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface Webhook {
  id: number;
  resource: string;
  action: string;
  url: string;
  notification_emails: string[];
  [key: string]: unknown;
}

function formatWebhook(w: Webhook): string {
  const lines = [`## Webhook ${w.id}`];
  lines.push(`- **Resource**: ${w.resource}`);
  lines.push(`- **Action**: ${w.action}`);
  lines.push(`- **URL**: ${w.url}`);
  if (w.notification_emails?.length) {
    lines.push(`- **Notification Emails**: ${w.notification_emails.join(", ")}`);
  }
  return lines.join("\n");
}

export function registerWebhookTools(server: McpServer): void {
  server.registerTool(
    "ir_get_supported_webhooks",
    {
      title: "Get Supported Webhook Events",
      description: "List all supported webhook resource/action combinations.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>("webhooks/supported.json");
        const text = formatResponse(data, params.response_format, (d) =>
          `# Supported Webhook Events\n\n\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\``
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_webhooks",
    {
      title: "List Webhooks",
      description: "List all configured webhooks.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<Webhook>("webhooks.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const hooks = d as Webhook[];
          if (!hooks.length) return "No webhooks configured.";
          return [`# Webhooks (Page ${params.page})`, "", ...hooks.map((w) => formatWebhook(w) + "\n")].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_webhook",
    {
      title: "Get Webhook",
      description: "Get details for a specific webhook by ID.",
      inputSchema: {
        webhook_id: z.number().int().describe("The webhook ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { webhook_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Webhook>(`webhooks/${params.webhook_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => formatWebhook(d as Webhook));
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_webhook",
    {
      title: "Create Webhook",
      description: "Create a new webhook. Use ir_get_supported_webhooks to see valid resource/action pairs.",
      inputSchema: {
        resource: z.string().describe("The resource to watch (e.g. 'file', 'folder', 'user')"),
        action: z.string().describe("The action to watch (e.g. 'created', 'deleted', 'processed')"),
        url: z.string().url().describe("URL where webhook events will be POSTed"),
        notification_emails: z.array(z.string().email()).describe("Emails to notify if webhook delivery fails"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      resource: string;
      action: string;
      url: string;
      notification_emails: string[];
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<Webhook>("webhooks.json", "POST", {
          resource: params.resource,
          action: params.action,
          url: params.url,
          notification_emails: params.notification_emails,
        });
        const text = formatResponse(data, params.response_format, (d) => `# Webhook Created\n\n${formatWebhook(d as Webhook)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_webhook",
    {
      title: "Update Webhook",
      description: "Update an existing webhook's URL or notification emails.",
      inputSchema: {
        webhook_id: z.number().int().describe("The webhook ID to update"),
        url: z.string().url().optional().describe("New webhook delivery URL"),
        notification_emails: z.array(z.string().email()).optional().describe("Updated notification emails"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      webhook_id: number;
      url?: string;
      notification_emails?: string[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.url) body.url = params.url;
        if (params.notification_emails) body.notification_emails = params.notification_emails;
        const data = await apiRequest<Webhook>(`webhooks/${params.webhook_id}.json`, "PUT", body);
        const text = formatResponse(data, params.response_format, (d) => `# Webhook Updated\n\n${formatWebhook(d as Webhook)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_webhook",
    {
      title: "Delete Webhook",
      description: "Delete a webhook.",
      inputSchema: { webhook_id: z.number().int().describe("The webhook ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { webhook_id: number }) => {
      try {
        await apiRequest(`webhooks/${params.webhook_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Webhook ${params.webhook_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

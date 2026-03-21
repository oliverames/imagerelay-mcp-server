import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface FolderLink {
  id: number;
  uid: string;
  folder_id: number;
  created_at: string;
  [key: string]: unknown;
}

interface UploadLink {
  id: number;
  uid: string;
  folder_id: number;
  created_at: string;
  [key: string]: unknown;
}

export function registerLinkTools(server: McpServer): void {
  // Folder Links
  server.registerTool(
    "ir_get_folder_links",
    {
      title: "List Folder Links",
      description: "List all folder sharing links.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<FolderLink>("folder_links.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const links = d as FolderLink[];
          if (!links.length) return "No folder links found.";
          return [`# Folder Links (Page ${params.page})`, "",
            ...links.map((l) => `- **Link ${l.id}** — Folder ${l.folder_id}, Created ${formatDate(l.created_at)}`)
          ].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_folder_link",
    {
      title: "Get Folder Link",
      description: "Get details for a specific folder link by ID.",
      inputSchema: {
        folder_link_id: z.number().int().describe("The folder link ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { folder_link_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<FolderLink>(`folder_links/${params.folder_link_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const l = d as FolderLink;
          return `# Folder Link\n\n- **ID**: ${l.id}\n- **Folder**: ${l.folder_id}\n- **UID**: ${l.uid}\n- **Created**: ${formatDate(l.created_at)}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_folder_link",
    {
      title: "Create Folder Link",
      description: "Create a sharing link for a folder. Requires download permission, expiry, tracking, and purpose.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID to share"),
        allows_download: z.boolean().describe("Whether the link allows file downloads"),
        expires_on: z.string().describe("Expiration date for the link (ISO date string)"),
        show_tracking: z.boolean().describe("Whether to show tracking info"),
        purpose: z.string().min(1).describe("Purpose description for the link"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { folder_id: number; allows_download: boolean; expires_on: string; show_tracking: boolean; purpose: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<FolderLink>("folder_links.json", "POST", {
          folder_id: params.folder_id,
          allows_download: params.allows_download,
          expires_on: params.expires_on,
          show_tracking: params.show_tracking,
          purpose: params.purpose,
        });
        const text = formatResponse(data, params.response_format, (d) => {
          const l = d as FolderLink;
          return `# Folder Link Created\n\n- **ID**: ${l.id}\n- **Folder**: ${l.folder_id}\n- **UID**: ${l.uid}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_folder_link",
    {
      title: "Delete Folder Link",
      description: "Delete a folder sharing link.",
      inputSchema: { folder_link_id: z.number().int().describe("The folder link ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { folder_link_id: number }) => {
      try {
        await apiRequest(`folder_links/${params.folder_link_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Folder link ${params.folder_link_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // Upload Links
  server.registerTool(
    "ir_get_upload_links",
    {
      title: "List Upload Links",
      description: "List all upload links that allow external users to upload files.",
      inputSchema: { ...PaginationSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<UploadLink>("upload_links.json", { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const links = d as UploadLink[];
          if (!links.length) return "No upload links found.";
          return [`# Upload Links (Page ${params.page})`, "",
            ...links.map((l) => `- **Link ${l.id}** — Folder ${l.folder_id}, Created ${formatDate(l.created_at)}`)
          ].join("\n") + formatPaginationHint(result.pagination);
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_upload_link",
    {
      title: "Get Upload Link",
      description: "Get details for a specific upload link by ID.",
      inputSchema: {
        upload_link_id: z.number().int().describe("The upload link ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { upload_link_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<UploadLink>(`upload_links/${params.upload_link_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const l = d as UploadLink;
          return `# Upload Link\n\n- **ID**: ${l.id}\n- **Folder**: ${l.folder_id}\n- **UID**: ${l.uid}\n- **Created**: ${formatDate(l.created_at)}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_upload_link",
    {
      title: "Create Upload Link",
      description: "Create an upload link for a folder, allowing external file uploads.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID for uploads"),
        purpose: z.string().min(1).describe("Purpose description for the upload link"),
        expires_on: z.string().optional().describe("Expiration date (ISO date string, optional)"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { folder_id: number; purpose: string; expires_on?: string; response_format: ResponseFormat }) => {
      try {
        const body: Record<string, unknown> = { folder_id: params.folder_id, purpose: params.purpose };
        if (params.expires_on) body.expires_on = params.expires_on;
        const data = await apiRequest<UploadLink>("upload_links.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const l = d as UploadLink;
          return `# Upload Link Created\n\n- **ID**: ${l.id}\n- **Folder**: ${l.folder_id}\n- **UID**: ${l.uid}`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_upload_link",
    {
      title: "Delete Upload Link",
      description: "Delete an upload link.",
      inputSchema: { upload_link_id: z.number().int().describe("The upload link ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { upload_link_id: number }) => {
      try {
        await apiRequest(`upload_links/${params.upload_link_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Upload link ${params.upload_link_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

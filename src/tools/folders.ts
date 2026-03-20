import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_on: string;
  updated_on: string;
  user_id: number;
  full_path: string;
  child_count: number;
  file_count: number;
  permission_ids: number[];
  [key: string]: unknown;
}

function formatFolder(f: Folder): string {
  const lines = [`## ${f.name} (ID: ${f.id})`];
  lines.push(`- **Path**: ${f.full_path || "/"}`);
  if (f.parent_id) lines.push(`- **Parent ID**: ${f.parent_id}`);
  lines.push(`- **Files**: ${f.file_count ?? "N/A"}`);
  lines.push(`- **Subfolders**: ${f.child_count ?? "N/A"}`);
  lines.push(`- **Created**: ${formatDate(f.created_on)}`);
  return lines.join("\n");
}

export function registerFolderTools(server: McpServer): void {
  server.registerTool(
    "ir_get_root_folder",
    {
      title: "Get Root Folder",
      description:
        "Get the root folder of the Image Relay library. Use this to discover the top-level folder ID.",
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
        const data = await apiRequest<Folder>("folders/root.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as Folder;
          return `# Root Folder\n\n${formatFolder(f)}`;
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
    "ir_get_folders",
    {
      title: "List Folders",
      description:
        "List all folders in the Image Relay library. Returns paginated results.",
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
        const result = await apiListRequest<Folder>("folders.json", {
          page: params.page,
        });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const folders = d as Folder[];
          if (!folders.length) return "No folders found.";
          const lines = [`# Folders (Page ${params.page})`, ""];
          for (const f of folders) {
            lines.push(formatFolder(f));
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
    "ir_get_folder",
    {
      title: "Get Folder",
      description: "Get details for a specific folder by ID.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID to retrieve"),
        ...IdParamSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: { folder_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Folder>(
          `folders/${params.folder_id}.json`
        );
        const text = formatResponse(data, params.response_format, (d) =>
          formatFolder(d as Folder)
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
    "ir_get_child_folders",
    {
      title: "Get Child Folders",
      description:
        "Get the immediate child folders of a given folder. Use ir_get_root_folder first to get the root folder ID.",
      inputSchema: {
        folder_id: z
          .number()
          .int()
          .describe("The parent folder ID whose children to list"),
        ...PaginationSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: {
      folder_id: number;
      page: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const result = await apiListRequest<Folder>(
          `folders/${params.folder_id}/children.json`,
          { page: params.page }
        );
        const text = formatResponse(result.data, params.response_format, (d) => {
          const folders = d as Folder[];
          if (!folders.length) return "No child folders found.";
          const lines = [
            `# Child Folders of ${params.folder_id} (Page ${params.page})`,
            "",
          ];
          for (const f of folders) {
            lines.push(formatFolder(f));
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
    "ir_create_folder",
    {
      title: "Create Folder",
      description:
        "Create a new folder in Image Relay. Specify the parent folder ID and name.",
      inputSchema: {
        parent_id: z
          .number()
          .int()
          .describe("The ID of the parent folder"),
        name: z.string().min(1).describe("Name for the new folder"),
        response_format: z
          .nativeEnum(ResponseFormat)
          .default(ResponseFormat.MARKDOWN)
          .describe("Output format"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: {
      parent_id: number;
      name: string;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<Folder>("folders.json", "POST", {
          parent_id: params.parent_id,
          name: params.name,
        });
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as Folder;
          return `# Folder Created\n\n${formatFolder(f)}`;
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
    "ir_update_folder",
    {
      title: "Update Folder",
      description: "Update a folder's name in Image Relay.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID to update"),
        name: z.string().min(1).describe("New name for the folder"),
        response_format: z
          .nativeEnum(ResponseFormat)
          .default(ResponseFormat.MARKDOWN)
          .describe("Output format"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: {
      folder_id: number;
      name: string;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<Folder>(
          `folders/${params.folder_id}.json`,
          "PUT",
          { name: params.name }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as Folder;
          return `# Folder Updated\n\n${formatFolder(f)}`;
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
    "ir_delete_folder",
    {
      title: "Delete Folder",
      description:
        "Delete a folder from Image Relay. This is destructive and cannot be undone.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: { folder_id: number }) => {
      try {
        await apiRequest(`folders/${params.folder_id}.json`, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `Folder ${params.folder_id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }],
        };
      }
    }
  );
}

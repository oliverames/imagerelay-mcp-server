import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import {
  formatResponse,
  formatPaginationHint,
  formatDate,
  formatFileSize,
} from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface FileTerm {
  term_id: number;
  value: string;
  [key: string]: unknown;
}

interface IRFile {
  id: number;
  name: string;
  content_type: string;
  size: number;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_on: string;
  deleted: boolean;
  user_id: number;
  expires_on: string | null;
  file_type_id: number;
  terms: FileTerm[];
  folders: string[];
  folder_ids: number[];
  permission_ids: number[];
  [key: string]: unknown;
}

function formatFile(f: IRFile): string {
  const lines = [`## ${f.name} (ID: ${f.id})`];
  lines.push(`- **Type**: ${f.content_type}`);
  lines.push(`- **Size**: ${formatFileSize(f.size)}`);
  if (f.width && f.height) lines.push(`- **Dimensions**: ${f.width}x${f.height}`);
  lines.push(`- **Created**: ${formatDate(f.created_at)}`);
  lines.push(`- **Updated**: ${formatDate(f.updated_on)}`);
  if (f.expires_on) lines.push(`- **Expires**: ${formatDate(f.expires_on)}`);
  lines.push(`- **File Type ID**: ${f.file_type_id}`);
  if (f.folders?.length) lines.push(`- **Folders**: ${f.folders.join(", ")}`);
  if (f.terms?.length) {
    lines.push("- **Metadata**:");
    for (const t of f.terms) {
      if (t.value) lines.push(`  - Term ${t.term_id}: ${t.value}`);
    }
  }
  return lines.join("\n");
}

export function registerFileTools(server: McpServer): void {
  server.registerTool(
    "ir_get_files",
    {
      title: "List Files in Folder",
      description:
        "List files in a specific Image Relay folder. Supports filtering by upload date, file type, search query, and recursive listing.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID to list files from"),
        uploaded_after: z
          .string()
          .optional()
          .describe(
            'Only return files uploaded after this date. Format: "YYYY-MM-DD HH:MM:SS GMT+00:00" or "YYYY-MM-DD"'
          ),
        file_type_id: z
          .number()
          .int()
          .optional()
          .describe("Filter by file type/metadata template ID"),
        recursive: z
          .boolean()
          .default(false)
          .describe("Include files from subfolders"),
        query: z
          .string()
          .optional()
          .describe("Search query to filter files"),
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
      uploaded_after?: string;
      file_type_id?: number;
      recursive: boolean;
      query?: string;
      page: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const queryParams: Record<string, unknown> = { page: params.page };
        if (params.uploaded_after) queryParams.uploaded_after = params.uploaded_after;
        if (params.file_type_id) queryParams.file_type_id = params.file_type_id;
        if (params.recursive) queryParams.recursive = true;
        if (params.query) queryParams.query = params.query;

        const result = await apiListRequest<IRFile>(
          `folders/${params.folder_id}/files.json`,
          queryParams
        );
        const text = formatResponse(result.data, params.response_format, (d) => {
          const files = d as IRFile[];
          if (!files.length) return "No files found in this folder.";
          const lines = [
            `# Files in Folder ${params.folder_id} (Page ${params.page})`,
            "",
          ];
          for (const f of files) {
            lines.push(formatFile(f));
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
    "ir_get_file",
    {
      title: "Get File",
      description: "Get details for a specific file by folder ID and file ID.",
      inputSchema: {
        folder_id: z.number().int().describe("The folder ID containing the file"),
        file_id: z.number().int().describe("The file ID to retrieve"),
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
      folder_id: number;
      file_id: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<IRFile>(
          `folders/${params.folder_id}/files/${params.file_id}.json`
        );
        const text = formatResponse(data, params.response_format, (d) =>
          formatFile(d as IRFile)
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
    "ir_upload_file_from_url",
    {
      title: "Upload File from URL",
      description:
        "Upload a file to Image Relay by providing a URL to download from. Requires folder ID, file type ID, and filename.",
      inputSchema: {
        filename: z.string().min(1).describe("Name for the uploaded file"),
        folder_id: z.number().int().describe("Destination folder ID"),
        file_type_id: z
          .number()
          .int()
          .describe("Metadata template / file type ID (get from ir_get_file_types)"),
        url: z.string().url().describe("Source URL to download the file from"),
        terms: z
          .array(
            z.object({
              term_id: z.number().int(),
              value: z.string(),
            })
          )
          .optional()
          .describe("Metadata terms to set on the file"),
        keyword_ids: z
          .array(z.number().int())
          .optional()
          .describe("Tag/keyword IDs to associate with the file"),
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
      filename: string;
      folder_id: number;
      file_type_id: number;
      url: string;
      terms?: { term_id: number; value: string }[];
      keyword_ids?: number[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {
          filename: params.filename,
          folder_id: params.folder_id,
          file_type_id: params.file_type_id,
          url: params.url,
          terms: params.terms ?? null,
        };
        if (params.keyword_ids) body.keyword_ids = params.keyword_ids;

        const data = await apiRequest<IRFile>("files.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# File Uploaded\n\n${formatFile(f)}`;
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
    "ir_update_file_metadata",
    {
      title: "Update File Metadata Terms",
      description:
        "Update metadata terms on a file. Provide the file ID, an array of term_id/value pairs, and whether to overwrite or append.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to update"),
        terms: z
          .array(
            z.object({
              term_id: z.number().int(),
              value: z.string(),
            })
          )
          .describe("Metadata terms to set"),
        overwrite: z
          .boolean()
          .default(false)
          .describe(
            "If true, overwrites existing term values. If false (default), appends to existing values."
          ),
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
      file_id: number;
      terms: { term_id: number; value: string }[];
      overwrite: boolean;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<IRFile>(
          `files/${params.file_id}/terms.json`,
          "POST",
          { terms: params.terms, overwrite: params.overwrite }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# File Metadata Updated\n\n${formatFile(f)}`;
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
    "ir_update_file_tags",
    {
      title: "Update File Tags",
      description:
        "Update keyword tags on a file. Provide tag IDs to add and/or remove.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to update"),
        add: z
          .array(z.number().int())
          .optional()
          .describe("Tag/keyword IDs to add to the file"),
        remove: z
          .array(z.number().int())
          .optional()
          .describe("Tag/keyword IDs to remove from the file"),
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
      file_id: number;
      add?: number[];
      remove?: number[];
      response_format: ResponseFormat;
    }) => {
      try {
        const tags: Record<string, number[]> = {};
        if (params.add) tags.add = params.add;
        if (params.remove) tags.remove = params.remove;
        const data = await apiRequest<IRFile>(
          `files/${params.file_id}/tags.json`,
          "POST",
          { tags }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# File Tags Updated\n\n${formatFile(f)}`;
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
    "ir_move_file",
    {
      title: "Move File",
      description:
        "Move a file to one or more folders. Provide folder IDs as an array of strings.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to move"),
        folder_ids: z
          .array(z.string())
          .min(1)
          .describe("Destination folder IDs (array of string IDs)"),
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
      file_id: number;
      folder_ids: string[];
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<IRFile>(
          `files/${params.file_id}/move.json`,
          "POST",
          { folder_ids: params.folder_ids }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# File Moved\n\n${formatFile(f)}`;
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
    "ir_delete_file",
    {
      title: "Delete File",
      description: "Delete a file from Image Relay. This is destructive.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: { file_id: number }) => {
      try {
        await apiRequest(`files/${params.file_id}.json`, "DELETE");
        return {
          content: [
            {
              type: "text",
              text: `File ${params.file_id} deleted successfully.`,
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

  server.registerTool(
    "ir_duplicate_file",
    {
      title: "Duplicate File",
      description:
        "Duplicate/copy a file to another folder. Optionally copies all metadata, tags, and IPTC fields.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to duplicate"),
        folder_id: z.string().describe("The destination folder ID (as a string)"),
        should_copy_metadata: z
          .boolean()
          .default(true)
          .describe(
            "If true, copies all metadata, tags/keywords, and IPTC fields. If false, the copy gets the destination folder's default file type."
          ),
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
      file_id: number;
      folder_id: string;
      should_copy_metadata: boolean;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<IRFile>(
          `files/${params.file_id}/dupicate.json`,
          "POST",
          {
            folder_id: params.folder_id,
            should_copy_metadata: params.should_copy_metadata,
          }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# File Duplicated\n\n${formatFile(f)}`;
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
    "ir_get_file_types",
    {
      title: "List File Types",
      description:
        "List all file types (metadata templates) available in the account. Use this to find file_type_id values for uploads.",
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
        const data = await apiRequest<unknown[]>("file_types.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const types = d as { id: number; name: string; [key: string]: unknown }[];
          if (!types.length) return "No file types found.";
          const lines = ["# File Types (Metadata Templates)", ""];
          for (const t of types) {
            lines.push(`- **${t.name}** (ID: ${t.id})`);
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

  server.registerTool(
    "ir_get_file_type",
    {
      title: "Get File Type",
      description: "Get details for a specific file type (metadata template) by ID.",
      inputSchema: {
        file_type_id: z.number().int().describe("The file type ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { file_type_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<{ id: number; name: string; [key: string]: unknown }>(`file_types/${params.file_type_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const t = d as { id: number; name: string; [key: string]: unknown };
          return `# File Type\n\n- **${t.name}** (ID: ${t.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_synced_file",
    {
      title: "Create Synced File",
      description:
        "Create a synced file across multiple folders. Changes to any synced instance apply to all copies.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to create synced copies from"),
        folder_ids: z
          .array(z.string())
          .min(1)
          .describe("Destination folder IDs (array of string IDs)"),
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
      file_id: number;
      folder_ids: string[];
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<IRFile>(
          `files/${params.file_id}/synced_file.json`,
          "POST",
          { folder_ids: params.folder_ids }
        );
        const text = formatResponse(data, params.response_format, (d) => {
          const f = d as IRFile;
          return `# Synced File Created\n\n${formatFile(f)}`;
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

  // Upload Jobs
  server.registerTool(
    "ir_create_upload_job",
    {
      title: "Create Upload Job",
      description:
        "Create a chunked upload job for uploading a file in parts. Returns upload_id and file_id needed for the chunk upload endpoint. Chunks must be uploaded via an external HTTP client (binary data).",
      inputSchema: {
        folder_id: z.number().int().describe("Destination folder ID"),
        file_type_id: z.number().int().describe("Metadata template / file type ID"),
        file_name: z.string().min(1).describe("Filename including extension"),
        file_size: z.number().int().describe("Total file size in bytes"),
        prefix: z.string().optional().describe("Optional subfolder path where the file will be stored"),
        terms: z
          .array(z.object({ term_id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Metadata terms to set on the file"),
        expires_on: z.string().optional().describe("Expiration date for the file (ISO date string)"),
        keyword_ids: z.array(z.number().int()).optional().describe("Tag/keyword IDs to associate"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      folder_id: number;
      file_type_id: number;
      file_name: string;
      file_size: number;
      prefix?: string;
      terms?: { term_id: number; value: string }[];
      expires_on?: string;
      keyword_ids?: number[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {
          folder_id: params.folder_id,
          file_type_id: params.file_type_id,
          files: [{ file_name: params.file_name, file_size: params.file_size }],
        };
        if (params.prefix) body.prefix = params.prefix;
        if (params.terms) body.terms = params.terms;
        if (params.expires_on) body.expires_on = params.expires_on;
        if (params.keyword_ids) body.keyword_ids = params.keyword_ids;

        const data = await apiRequest<unknown>("upload_jobs.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const job = d as { id: number; files?: { id: number }[]; [key: string]: unknown };
          const lines = ["# Upload Job Created", ""];
          lines.push(`- **Upload Job ID**: ${job.id}`);
          if (job.files && Array.isArray(job.files)) {
            for (const f of job.files) {
              lines.push(`- **Upload File ID**: ${f.id}`);
            }
          }
          lines.push("");
          lines.push("Use these IDs to upload file chunks via:");
          lines.push("`POST /upload_jobs/{upload_id}/files/{file_id}/chunks/{chunk_number}`");
          lines.push("(Chunks must be ≤ 5 MB binary data, uploaded via an external HTTP client)");
          return lines.join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_check_upload_job_status",
    {
      title: "Check Upload Job Status",
      description:
        "Check the status of a chunked upload job. While processing, finished will be null. Once complete, finished=true and asset_id contains the new file's ID.",
      inputSchema: {
        upload_job_id: z.number().int().describe("The upload job ID to check"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { upload_job_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`upload_jobs/${params.upload_job_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const job = d as { id: number; finished: boolean | null; asset_id: number | null; [key: string]: unknown };
          const lines = ["# Upload Job Status", ""];
          lines.push(`- **Job ID**: ${job.id}`);
          if (job.finished === null) {
            lines.push("- **Status**: Processing (waiting for more chunks)");
          } else if (job.finished) {
            lines.push("- **Status**: Complete");
            if (job.asset_id) lines.push(`- **Asset ID**: ${job.asset_id}`);
          } else {
            lines.push("- **Status**: Processing");
          }
          return lines.join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // File Versioning (chunked)
  server.registerTool(
    "ir_create_file_version",
    {
      title: "Create File Version (Get Upload UUID)",
      description:
        "Start a new version upload for a file. Returns a v4 UUID needed to upload version chunks. After obtaining the UUID, upload binary chunks externally, then call ir_complete_file_version.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID to create a new version for"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { file_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`files/${params.file_id}/versions.json`, "POST");
        const text = formatResponse(data, params.response_format, (d) => {
          const result = d as { uuid?: string; [key: string]: unknown };
          const lines = ["# File Version Upload Started", ""];
          if (result.uuid) {
            lines.push(`- **UUID**: ${result.uuid}`);
          }
          lines.push(`- **File ID**: ${params.file_id}`);
          lines.push("");
          lines.push("Upload chunks via:");
          lines.push(`\`POST /files/${params.file_id}/versions/{uuid}/chunk/{chunk_number}\``);
          lines.push("Then call ir_complete_file_version when done.");
          return lines.join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_complete_file_version",
    {
      title: "Complete File Version Upload",
      description:
        "Signal that all chunks for a file version update have been uploaded and the file is ready for processing.",
      inputSchema: {
        file_id: z.number().int().describe("The file ID being updated"),
        v4_uuid: z.string().min(1).describe("The v4 UUID returned from ir_create_file_version"),
        file_name: z.string().min(1).describe("Filename with extension for the new version"),
        chunk_count: z.number().int().min(1).describe("Total number of chunks that were uploaded"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      file_id: number;
      v4_uuid: string;
      file_name: string;
      chunk_count: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const data = await apiRequest<unknown>(
          `files/${params.file_id}/versions/${params.v4_uuid}/complete.json`,
          "POST",
          { file_name: params.file_name, chunk_count: params.chunk_count }
        );
        const text = formatResponse(data, params.response_format, (d) =>
          `# File Version Upload Complete\n\nFile ${params.file_id} version update is now processing.\n\n\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\``
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

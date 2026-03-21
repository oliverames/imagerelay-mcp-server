import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, handleApiError } from "../services/api-client.js";
import { formatResponse } from "../services/formatter.js";
import { IdParamSchema } from "../schemas/common.js";

interface CustomAttribute {
  id: number;
  name: string;
  [key: string]: unknown;
}

export function registerCustomAttributeTools(server: McpServer): void {
  server.registerTool(
    "ir_get_custom_attributes",
    {
      title: "List Custom Attributes",
      description: "List all product custom attributes.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<CustomAttribute[]>("product_custom_attributes.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const attrs = d as CustomAttribute[];
          if (!attrs.length) return "No custom attributes found.";
          return ["# Custom Attributes", "", ...attrs.map((a) => `- **${a.name}** (ID: ${a.id})`)].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_custom_attribute",
    {
      title: "Get Custom Attribute",
      description: "Get details for a specific custom attribute.",
      inputSchema: {
        attribute_id: z.number().int().describe("The custom attribute ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { attribute_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<CustomAttribute>(`product_custom_attributes/${params.attribute_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const a = d as CustomAttribute;
          return `# Custom Attribute\n\n- **${a.name}** (ID: ${a.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_custom_attribute",
    {
      title: "Create Custom Attribute",
      description: "Create a new product custom attribute.",
      inputSchema: {
        name: z.string().min(1).describe("Attribute name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<CustomAttribute>("product_custom_attributes.json", "POST", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const a = d as CustomAttribute;
          return `# Custom Attribute Created\n\n- **${a.name}** (ID: ${a.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_custom_attribute",
    {
      title: "Update Custom Attribute",
      description: "Update a product custom attribute's name.",
      inputSchema: {
        attribute_id: z.number().int().describe("The custom attribute ID to update"),
        name: z.string().min(1).describe("New attribute name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { attribute_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<CustomAttribute>(`product_custom_attributes/${params.attribute_id}.json`, "PUT", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const a = d as CustomAttribute;
          return `# Custom Attribute Updated\n\n- **${a.name}** (ID: ${a.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

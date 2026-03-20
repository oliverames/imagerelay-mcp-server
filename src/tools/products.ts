import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatDate } from "../services/formatter.js";
import { PaginationSchema, IdParamSchema } from "../schemas/common.js";

interface Product {
  id: number;
  name: string;
  sku: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface Catalog {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Category {
  id: number;
  name: string;
  [key: string]: unknown;
}

function formatProduct(p: Product): string {
  const lines = [`## ${p.name} (ID: ${p.id})`];
  if (p.sku) lines.push(`- **SKU**: ${p.sku}`);
  lines.push(`- **Created**: ${formatDate(p.created_at)}`);
  return lines.join("\n");
}

export function registerProductTools(server: McpServer): void {
  // Products
  server.registerTool(
    "ir_get_products",
    {
      title: "List Products",
      description: "List products in the PIM. Supports filtering by name, category, and variant options.",
      inputSchema: {
        name: z.string().optional().describe("Filter by product name"),
        in_category: z.number().int().optional().describe("Filter by category ID"),
        with_variants: z.boolean().optional().describe("Include variant data"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      name?: string;
      in_category?: number;
      with_variants?: boolean;
      page: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const queryParams: Record<string, unknown> = { page: params.page };
        if (params.name) queryParams.name = params.name;
        if (params.in_category) queryParams.in_category = params.in_category;
        if (params.with_variants) queryParams.with_variants = params.with_variants;

        const data = await apiRequest<Product[]>("products.json", "GET", undefined, queryParams);
        const text = formatResponse(data, params.response_format, (d) => {
          const products = d as Product[];
          if (!products.length) return "No products found.";
          return [`# Products (Page ${params.page})`, "", ...products.map((p) => formatProduct(p) + "\n")].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_product",
    {
      title: "Get Product",
      description: "Get details for a specific product.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { product_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Product>(`products/${params.product_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => formatProduct(d as Product));
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_product",
    {
      title: "Create Product",
      description: "Create a new product in the PIM.",
      inputSchema: {
        name: z.string().min(1).describe("Product name"),
        sku: z.string().optional().describe("Product SKU"),
        product_template_id: z.number().int().optional().describe("Template ID for this product"),
        product_category_id: z.number().int().optional().describe("Category ID"),
        has_variants: z.boolean().optional().describe("Whether the product has variants"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      name: string;
      sku?: string;
      product_template_id?: number;
      product_category_id?: number;
      has_variants?: boolean;
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.sku) body.sku = params.sku;
        if (params.product_template_id) body.product_template_id = params.product_template_id;
        if (params.product_category_id) body.product_category_id = params.product_category_id;
        if (params.has_variants !== undefined) body.has_variants = params.has_variants;

        const data = await apiRequest<Product>("products.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# Product Created\n\n${formatProduct(d as Product)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_product",
    {
      title: "Delete Product",
      description: "Delete a product from the PIM.",
      inputSchema: { product_id: z.number().int().describe("The product ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { product_id: number }) => {
      try {
        await apiRequest(`products/${params.product_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Product ${params.product_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // Catalogs
  server.registerTool(
    "ir_get_catalogs",
    {
      title: "List Catalogs",
      description: "List all product catalogs.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Catalog[]>("product_catalogs.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const catalogs = d as Catalog[];
          if (!catalogs.length) return "No catalogs found.";
          return ["# Catalogs", "", ...catalogs.map((c) => `- **${c.name}** (ID: ${c.id})`)].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_catalog",
    {
      title: "Create Catalog",
      description: "Create a new product catalog.",
      inputSchema: {
        name: z.string().min(1).describe("Catalog name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Catalog>("product_catalogs.json", "POST", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const c = d as Catalog;
          return `# Catalog Created\n\n- **${c.name}** (ID: ${c.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // Categories
  server.registerTool(
    "ir_get_categories",
    {
      title: "List Product Categories",
      description: "List all product categories.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Category[]>("product_categories.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const cats = d as Category[];
          if (!cats.length) return "No categories found.";
          return ["# Product Categories", "", ...cats.map((c) => `- **${c.name}** (ID: ${c.id})`)].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // Templates
  server.registerTool(
    "ir_get_templates",
    {
      title: "List Product Templates",
      description: "List all product templates.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown[]>("product_templates.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const templates = d as { id: number; name: string; [key: string]: unknown }[];
          if (!templates.length) return "No templates found.";
          return ["# Product Templates", "", ...templates.map((t) => `- **${t.name}** (ID: ${t.id})`)].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

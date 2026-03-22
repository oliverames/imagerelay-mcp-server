import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat } from "../constants.js";
import { apiRequest, apiListRequest, handleApiError } from "../services/api-client.js";
import { formatResponse, formatPaginationHint, formatDate } from "../services/formatter.js";
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
      description: "List products in the PIM. Supports filtering by name, category, variant options, template, and dimension.",
      inputSchema: {
        name: z.string().optional().describe("Filter by product name"),
        in_category: z.number().int().optional().describe("Filter by category ID"),
        with_variants: z.boolean().optional().describe("Filter products that have/don't have variants enabled"),
        with_variant: z.number().int().optional().describe("Filter by product template ID (see ir_get_templates)"),
        with_variant_dimension_id: z.number().int().optional().describe("Filter by variant dimension ID"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      name?: string;
      in_category?: number;
      with_variants?: boolean;
      with_variant?: number;
      with_variant_dimension_id?: number;
      page: number;
      response_format: ResponseFormat;
    }) => {
      try {
        const queryParams: Record<string, unknown> = { page: params.page };
        if (params.name) queryParams.name = params.name;
        if (params.in_category) queryParams.in_category = params.in_category;
        if (params.with_variants !== undefined) queryParams.with_variants = params.with_variants;
        if (params.with_variant) queryParams.with_variant = params.with_variant;
        if (params.with_variant_dimension_id) queryParams.with_variant_dimension_id = params.with_variant_dimension_id;

        const result = await apiListRequest<Product>("products.json", queryParams);
        const text = formatResponse(result.data, params.response_format, (d) => {
          const products = d as Product[];
          if (!products.length) return "No products found.";
          return [`# Products (Page ${params.page})`, "", ...products.map((p) => formatProduct(p) + "\n")].join("\n") + formatPaginationHint(result.pagination);
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
        dimension1_name: z.string().optional().describe("Name for dimension 1 (e.g. 'Size')"),
        dimension1_value: z.string().optional().describe("Value for dimension 1"),
        dimension1_id: z.number().int().optional().describe("ID for an existing dimension 1"),
        dimension2_name: z.string().optional().describe("Name for dimension 2 (e.g. 'Color')"),
        dimension2_value: z.string().optional().describe("Value for dimension 2"),
        dimension2_id: z.number().int().optional().describe("ID for an existing dimension 2"),
        dimension3_name: z.string().optional().describe("Name for dimension 3"),
        dimension3_value: z.string().optional().describe("Value for dimension 3"),
        dimension3_id: z.number().int().optional().describe("ID for an existing dimension 3"),
        product_custom_attributes: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Custom attribute ID/value pairs"),
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
      dimension1_name?: string;
      dimension1_value?: string;
      dimension1_id?: number;
      dimension2_name?: string;
      dimension2_value?: string;
      dimension2_id?: number;
      dimension3_name?: string;
      dimension3_value?: string;
      dimension3_id?: number;
      product_custom_attributes?: { id: number; value: string }[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.sku) body.sku = params.sku;
        if (params.product_template_id) body.product_template_id = params.product_template_id;
        if (params.product_category_id) body.product_category_id = params.product_category_id;
        if (params.has_variants !== undefined) body.has_variants = params.has_variants;
        if (params.dimension1_name) body.dimension1_name = params.dimension1_name;
        if (params.dimension1_value) body.dimension1_value = params.dimension1_value;
        if (params.dimension1_id) body.dimension1_id = params.dimension1_id;
        if (params.dimension2_name) body.dimension2_name = params.dimension2_name;
        if (params.dimension2_value) body.dimension2_value = params.dimension2_value;
        if (params.dimension2_id) body.dimension2_id = params.dimension2_id;
        if (params.dimension3_name) body.dimension3_name = params.dimension3_name;
        if (params.dimension3_value) body.dimension3_value = params.dimension3_value;
        if (params.dimension3_id) body.dimension3_id = params.dimension3_id;
        if (params.product_custom_attributes) body.product_custom_attributes = params.product_custom_attributes;

        const data = await apiRequest<Product>("products.json", "POST", body);
        const text = formatResponse(data, params.response_format, (d) => `# Product Created\n\n${formatProduct(d as Product)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_product_variants",
    {
      title: "Get Product Variants",
      description: "List all variants for a specific product.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID whose variants to retrieve"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { product_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown[]>(`products/${params.product_id}/variants.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const variants = d as { id: number; name: string; [key: string]: unknown }[];
          if (!Array.isArray(variants) || !variants.length) return "No variants found for this product.";
          return [`# Variants for Product ${params.product_id}`, "",
            ...variants.map((v) => `- **${v.name || `Variant ${v.id}`}** (ID: ${v.id})`)
          ].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_product",
    {
      title: "Update Product",
      description: "Update a product in the PIM.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID to update"),
        name: z.string().min(1).describe("New product name"),
        sku: z.string().optional().describe("New product SKU"),
        product_template_id: z.number().int().optional().describe("New template ID"),
        product_category_id: z.number().int().optional().describe("New category ID"),
        has_variants: z.boolean().optional().describe("Whether the product has variants"),
        dimension1_name: z.string().optional().describe("Name for dimension 1"),
        dimension1_value: z.string().optional().describe("Value for dimension 1"),
        dimension1_id: z.number().int().optional().describe("ID for dimension 1"),
        dimension2_name: z.string().optional().describe("Name for dimension 2"),
        dimension2_value: z.string().optional().describe("Value for dimension 2"),
        dimension2_id: z.number().int().optional().describe("ID for dimension 2"),
        dimension3_name: z.string().optional().describe("Name for dimension 3"),
        dimension3_value: z.string().optional().describe("Value for dimension 3"),
        dimension3_id: z.number().int().optional().describe("ID for dimension 3"),
        product_custom_attributes: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Custom attribute ID/value pairs"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      product_id: number;
      name: string;
      sku?: string;
      product_template_id?: number;
      product_category_id?: number;
      has_variants?: boolean;
      dimension1_name?: string;
      dimension1_value?: string;
      dimension1_id?: number;
      dimension2_name?: string;
      dimension2_value?: string;
      dimension2_id?: number;
      dimension3_name?: string;
      dimension3_value?: string;
      dimension3_id?: number;
      product_custom_attributes?: { id: number; value: string }[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.sku) body.sku = params.sku;
        if (params.product_template_id) body.product_template_id = params.product_template_id;
        if (params.product_category_id) body.product_category_id = params.product_category_id;
        if (params.has_variants !== undefined) body.has_variants = params.has_variants;
        if (params.dimension1_name) body.dimension1_name = params.dimension1_name;
        if (params.dimension1_value) body.dimension1_value = params.dimension1_value;
        if (params.dimension1_id) body.dimension1_id = params.dimension1_id;
        if (params.dimension2_name) body.dimension2_name = params.dimension2_name;
        if (params.dimension2_value) body.dimension2_value = params.dimension2_value;
        if (params.dimension2_id) body.dimension2_id = params.dimension2_id;
        if (params.dimension3_name) body.dimension3_name = params.dimension3_name;
        if (params.dimension3_value) body.dimension3_value = params.dimension3_value;
        if (params.dimension3_id) body.dimension3_id = params.dimension3_id;
        if (params.product_custom_attributes) body.product_custom_attributes = params.product_custom_attributes;

        const data = await apiRequest<Product>(`products/${params.product_id}.json`, "PUT", body);
        const text = formatResponse(data, params.response_format, (d) => `# Product Updated\n\n${formatProduct(d as Product)}`);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_product_catalog",
    {
      title: "Get Product's Catalog",
      description: "Get the catalog that a product belongs to.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { product_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Catalog>(`products/${params.product_id}/catalog.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const c = d as Catalog;
          return `# Product Catalog\n\n- **${c.name}** (ID: ${c.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_product_variant",
    {
      title: "Get Product Variant",
      description: "Get details for a specific product variant.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        variant_id: z.number().int().describe("The variant ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { product_id: number; variant_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`products/${params.product_id}/variants/${params.variant_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const v = d as { id: number; name: string; [key: string]: unknown };
          return `# Product Variant\n\n- **${v.name || `Variant ${v.id}`}** (ID: ${v.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_variant",
    {
      title: "Create Product Variant",
      description: "Create a new variant for a product.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        name: z.string().optional().describe("Variant name"),
        variant_dimension_options: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Variant dimension option IDs and values"),
        product_custom_attributes: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Custom attribute ID/value pairs"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: {
      product_id: number;
      name?: string;
      variant_dimension_options?: { id: number; value: string }[];
      product_custom_attributes?: { id: number; value: string }[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.name) body.name = params.name;
        if (params.variant_dimension_options) body.variant_dimension_options = params.variant_dimension_options;
        if (params.product_custom_attributes) body.product_custom_attributes = params.product_custom_attributes;

        const data = await apiRequest<unknown>(`products/${params.product_id}/variants.json`, "POST", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const v = d as { id: number; name: string; [key: string]: unknown };
          return `# Variant Created\n\n- **${v.name || `Variant ${v.id}`}** (ID: ${v.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_variant",
    {
      title: "Update Product Variant",
      description: "Update a product variant.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        variant_id: z.number().int().describe("The variant ID to update"),
        name: z.string().optional().describe("New variant name"),
        variant_dimension_options: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Updated dimension option IDs and values"),
        product_custom_attributes: z
          .array(z.object({ id: z.number().int(), value: z.string() }))
          .optional()
          .describe("Updated custom attribute ID/value pairs"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: {
      product_id: number;
      variant_id: number;
      name?: string;
      variant_dimension_options?: { id: number; value: string }[];
      product_custom_attributes?: { id: number; value: string }[];
      response_format: ResponseFormat;
    }) => {
      try {
        const body: Record<string, unknown> = {};
        if (params.name) body.name = params.name;
        if (params.variant_dimension_options) body.variant_dimension_options = params.variant_dimension_options;
        if (params.product_custom_attributes) body.product_custom_attributes = params.product_custom_attributes;

        const data = await apiRequest<unknown>(`products/${params.product_id}/variants/${params.variant_id}.json`, "PATCH", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const v = d as { id: number; name: string; [key: string]: unknown };
          return `# Variant Updated\n\n- **${v.name || `Variant ${v.id}`}** (ID: ${v.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_variant",
    {
      title: "Delete Product Variant",
      description: "Delete a product variant.",
      inputSchema: {
        product_id: z.number().int().describe("The product ID"),
        variant_id: z.number().int().describe("The variant ID to delete"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { product_id: number; variant_id: number }) => {
      try {
        await apiRequest(`products/${params.product_id}/variants/${params.variant_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Variant ${params.variant_id} deleted.` }] };
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
    "ir_get_catalog",
    {
      title: "Get Catalog",
      description: "Get details for a specific product catalog by ID.",
      inputSchema: {
        catalog_id: z.number().int().describe("The catalog ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { catalog_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Catalog>(`product_catalogs/${params.catalog_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const c = d as Catalog;
          return `# Catalog\n\n- **${c.name}** (ID: ${c.id})`;
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
        summary: z.string().optional().describe("Catalog summary/description"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; summary?: string; response_format: ResponseFormat }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.summary) body.summary = params.summary;
        const data = await apiRequest<Catalog>("product_catalogs.json", "POST", body);
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

  server.registerTool(
    "ir_update_catalog",
    {
      title: "Update Catalog",
      description: "Update a product catalog's name and/or summary.",
      inputSchema: {
        catalog_id: z.number().int().describe("The catalog ID to update"),
        name: z.string().min(1).describe("New catalog name"),
        summary: z.string().optional().describe("New catalog summary/description"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { catalog_id: number; name: string; summary?: string; response_format: ResponseFormat }) => {
      try {
        const body: Record<string, unknown> = { name: params.name };
        if (params.summary) body.summary = params.summary;
        const data = await apiRequest<Catalog>(`product_catalogs/${params.catalog_id}.json`, "PUT", body);
        const text = formatResponse(data, params.response_format, (d) => {
          const c = d as Catalog;
          return `# Catalog Updated\n\n- **${c.name}** (ID: ${c.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_delete_catalog",
    {
      title: "Delete Catalog",
      description: "Delete a product catalog.",
      inputSchema: { catalog_id: z.number().int().describe("The catalog ID to delete") },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async (params: { catalog_id: number }) => {
      try {
        await apiRequest(`product_catalogs/${params.catalog_id}.json`, "DELETE");
        return { content: [{ type: "text", text: `Catalog ${params.catalog_id} deleted.` }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_catalog_products",
    {
      title: "Get Catalog Products",
      description: "List all products in a specific catalog.",
      inputSchema: {
        catalog_id: z.number().int().describe("The catalog ID"),
        ...PaginationSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { catalog_id: number; page: number; response_format: ResponseFormat }) => {
      try {
        const result = await apiListRequest<Product>(`product_catalogs/${params.catalog_id}/products.json`, { page: params.page });
        const text = formatResponse(result.data, params.response_format, (d) => {
          const products = d as Product[];
          if (!products.length) return "No products in this catalog.";
          return [`# Catalog ${params.catalog_id} Products (Page ${params.page})`, "", ...products.map((p) => formatProduct(p) + "\n")].join("\n") + formatPaginationHint(result.pagination);
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

  server.registerTool(
    "ir_get_category",
    {
      title: "Get Product Category",
      description: "Get details for a specific product category.",
      inputSchema: {
        category_id: z.number().int().describe("The category ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { category_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<Category>(`product_categories/${params.category_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const c = d as Category;
          return `# Product Category\n\n- **${c.name}** (ID: ${c.id})`;
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

  server.registerTool(
    "ir_get_template",
    {
      title: "Get Product Template",
      description: "Get details for a specific product template.",
      inputSchema: {
        template_id: z.number().int().describe("The template ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { template_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_templates/${params.template_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const t = d as { id: number; name: string; [key: string]: unknown };
          return `# Product Template\n\n- **${t.name}** (ID: ${t.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_template",
    {
      title: "Create Product Template",
      description: "Create a new product template.",
      inputSchema: {
        name: z.string().min(1).describe("Template name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>("product_templates.json", "POST", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const t = d as { id: number; name: string; [key: string]: unknown };
          return `# Template Created\n\n- **${t.name}** (ID: ${t.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_template",
    {
      title: "Update Product Template",
      description: "Update a product template's name.",
      inputSchema: {
        template_id: z.number().int().describe("The template ID to update"),
        name: z.string().min(1).describe("New template name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { template_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_templates/${params.template_id}.json`, "PUT", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const t = d as { id: number; name: string; [key: string]: unknown };
          return `# Template Updated\n\n- **${t.name}** (ID: ${t.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_channel_template_mappings",
    {
      title: "Get Channel Template Mappings",
      description: "Get channel template mappings for a product channel template.",
      inputSchema: {
        channel_template_id: z.number().int().describe("The channel template ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { channel_template_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_channel_template_mappings/${params.channel_template_id}.json`);
        const text = formatResponse(data, params.response_format, (d) =>
          `# Channel Template Mappings\n\n\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\``
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  // Dimensions
  server.registerTool(
    "ir_get_dimensions",
    {
      title: "List Dimensions",
      description: "List all product dimensions.",
      inputSchema: { ...IdParamSchema },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown[]>("product_dimensions.json");
        const text = formatResponse(data, params.response_format, (d) => {
          const dims = d as { id: number; name: string; [key: string]: unknown }[];
          if (!dims.length) return "No dimensions found.";
          return ["# Product Dimensions", "", ...dims.map((dim) => `- **${dim.name}** (ID: ${dim.id})`)].join("\n");
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_get_dimension",
    {
      title: "Get Dimension",
      description: "Get details for a specific product dimension.",
      inputSchema: {
        dimension_id: z.number().int().describe("The dimension ID"),
        ...IdParamSchema,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { dimension_id: number; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_dimensions/${params.dimension_id}.json`);
        const text = formatResponse(data, params.response_format, (d) => {
          const dim = d as { id: number; name: string; [key: string]: unknown };
          return `# Product Dimension\n\n- **${dim.name}** (ID: ${dim.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_create_dimension",
    {
      title: "Create Dimension",
      description: "Create a new product dimension.",
      inputSchema: {
        name: z.string().min(1).describe("Dimension name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>("product_dimensions.json", "POST", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const dim = d as { id: number; name: string; [key: string]: unknown };
          return `# Dimension Created\n\n- **${dim.name}** (ID: ${dim.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_update_dimension",
    {
      title: "Update Dimension",
      description: "Update a product dimension's name.",
      inputSchema: {
        dimension_id: z.number().int().describe("The dimension ID to update"),
        name: z.string().min(1).describe("New dimension name"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (params: { dimension_id: number; name: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_dimensions/${params.dimension_id}.json`, "PUT", { name: params.name });
        const text = formatResponse(data, params.response_format, (d) => {
          const dim = d as { id: number; name: string; [key: string]: unknown };
          return `# Dimension Updated\n\n- **${dim.name}** (ID: ${dim.id})`;
        });
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "ir_add_dimension_option",
    {
      title: "Add Dimension Option",
      description: "Add an option value to a product dimension.",
      inputSchema: {
        dimension_id: z.number().int().describe("The dimension ID"),
        value: z.string().min(1).describe("The option value to add"),
        response_format: z.nativeEnum(ResponseFormat).default(ResponseFormat.MARKDOWN).describe("Output format"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (params: { dimension_id: number; value: string; response_format: ResponseFormat }) => {
      try {
        const data = await apiRequest<unknown>(`product_dimensions/${params.dimension_id}/add_option.json`, "POST", { value: params.value });
        const text = formatResponse(data, params.response_format, (d) =>
          `# Dimension Option Added\n\n\`\`\`json\n${JSON.stringify(d, null, 2)}\n\`\`\``
        );
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: handleApiError(error) }] };
      }
    }
  );
}

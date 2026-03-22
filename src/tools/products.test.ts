import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_PRODUCT, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerProductTools } = await import("./products.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerProductTools(server);
  return server;
}

describe("Product Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_products", () => {
    it("lists products", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_PRODUCT]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_products"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Widget Pro");
      expect(result.content[0].text).toContain("WGT-001");
    });

    it("passes filter params", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_products"];
      await tool.handler({ name: "Widget", in_category: 5, with_variants: true, page: 1, response_format: "markdown" });
      expect(mockListRequest).toHaveBeenCalledWith("products.json", {
        page: 1,
        name: "Widget",
        in_category: 5,
        with_variants: true,
      });
    });
  });

  describe("ir_get_product", () => {
    it("gets a specific product", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_PRODUCT);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_product"];
      const result = await tool.handler({ product_id: 600, response_format: "json" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.name).toBe("Widget Pro");
      expect(parsed.sku).toBe("WGT-001");
    });
  });

  describe("ir_create_product", () => {
    it("creates a product with all fields", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_PRODUCT, id: 601 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_product"];
      const result = await tool.handler({
        name: "Widget Pro",
        sku: "WGT-001",
        product_template_id: 1,
        product_category_id: 2,
        has_variants: true,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("Product Created");
      expect(mockRequest).toHaveBeenCalledWith("products.json", "POST", {
        name: "Widget Pro",
        sku: "WGT-001",
        product_template_id: 1,
        product_category_id: 2,
        has_variants: true,
      });
    });

    it("passes dimension IDs when provided", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_PRODUCT, id: 602 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_product"];
      await tool.handler({
        name: "Sized Widget",
        dimension1_id: 10,
        dimension1_name: "Size",
        dimension1_value: "Large",
        dimension2_id: 20,
        response_format: "json",
      });
      expect(mockRequest).toHaveBeenCalledWith("products.json", "POST",
        expect.objectContaining({
          name: "Sized Widget",
          dimension1_id: 10,
          dimension1_name: "Size",
          dimension1_value: "Large",
          dimension2_id: 20,
        })
      );
    });
  });

  describe("ir_get_product_variants", () => {
    it("lists variants for a product", async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, name: "Small Red" },
        { id: 2, name: "Large Blue" },
      ]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_product_variants"];
      const result = await tool.handler({ product_id: 600, response_format: "markdown" });
      expect(result.content[0].text).toContain("Small Red");
      expect(result.content[0].text).toContain("Large Blue");
      expect(mockRequest).toHaveBeenCalledWith("products/600/variants.json");
    });

    it("handles empty variants", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_product_variants"];
      const result = await tool.handler({ product_id: 600, response_format: "markdown" });
      expect(result.content[0].text).toContain("No variants found");
    });
  });

  describe("ir_delete_product", () => {
    it("deletes a product", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_product"];
      const result = await tool.handler({ product_id: 600 });
      expect(result.content[0].text).toContain("deleted");
    });
  });

  describe("ir_get_catalogs", () => {
    it("lists catalogs", async () => {
      mockRequest.mockResolvedValueOnce([{ id: 1, name: "Spring 2024" }]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_catalogs"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Spring 2024");
      expect(result.content[0].text).toContain("ID: 1");
    });
  });

  describe("ir_get_catalog", () => {
    it("gets a single catalog", async () => {
      mockRequest.mockResolvedValueOnce({ id: 1, name: "Spring 2025" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_catalog"];
      const result = await tool.handler({ catalog_id: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Spring 2025");
      expect(mockRequest).toHaveBeenCalledWith("product_catalogs/1.json");
    });
  });

  describe("ir_create_catalog", () => {
    it("creates a catalog", async () => {
      mockRequest.mockResolvedValueOnce({ id: 2, name: "Fall 2024" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_catalog"];
      const result = await tool.handler({ name: "Fall 2024", response_format: "markdown" });
      expect(result.content[0].text).toContain("Catalog Created");
      expect(result.content[0].text).toContain("Fall 2024");
    });
  });

  describe("ir_get_categories", () => {
    it("lists categories", async () => {
      mockRequest.mockResolvedValueOnce([{ id: 10, name: "Electronics" }]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_categories"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Electronics");
    });
  });

  describe("ir_get_templates", () => {
    it("lists templates", async () => {
      mockRequest.mockResolvedValueOnce([{ id: 1, name: "Standard Product" }]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_templates"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Standard Product");
    });
  });

  describe("ir_update_product", () => {
    it("updates a product", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_PRODUCT, name: "Widget Ultra" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_product"];
      const result = await tool.handler({ product_id: 600, name: "Widget Ultra", response_format: "markdown" });
      expect(result.content[0].text).toContain("Product Updated");
      expect(mockRequest).toHaveBeenCalledWith("products/600.json", "PUT", expect.objectContaining({ name: "Widget Ultra" }));
    });
  });

  describe("ir_update_catalog", () => {
    it("updates a catalog", async () => {
      mockRequest.mockResolvedValueOnce({ id: 1, name: "Winter 2024" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_catalog"];
      const result = await tool.handler({ catalog_id: 1, name: "Winter 2024", response_format: "markdown" });
      expect(result.content[0].text).toContain("Catalog Updated");
      expect(mockRequest).toHaveBeenCalledWith("product_catalogs/1.json", "PUT", { name: "Winter 2024" });
    });

    it("passes summary when provided", async () => {
      mockRequest.mockResolvedValueOnce({ id: 1, name: "Winter 2024" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_catalog"];
      await tool.handler({ catalog_id: 1, name: "Winter 2024", summary: "Holiday season catalog", response_format: "markdown" });
      expect(mockRequest).toHaveBeenCalledWith("product_catalogs/1.json", "PUT", { name: "Winter 2024", summary: "Holiday season catalog" });
    });
  });

  describe("ir_delete_catalog", () => {
    it("deletes a catalog", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_catalog"];
      const result = await tool.handler({ catalog_id: 1 });
      expect(result.content[0].text).toContain("deleted");
    });
  });

  describe("ir_create_variant", () => {
    it("creates a variant", async () => {
      mockRequest.mockResolvedValueOnce({ id: 50, name: "Large Red" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_variant"];
      const result = await tool.handler({ product_id: 600, name: "Large Red", response_format: "markdown" });
      expect(result.content[0].text).toContain("Variant Created");
      expect(mockRequest).toHaveBeenCalledWith("products/600/variants.json", "POST", expect.objectContaining({ name: "Large Red" }));
    });
  });

  describe("ir_update_variant", () => {
    it("updates a variant with PATCH", async () => {
      mockRequest.mockResolvedValueOnce({ id: 50, name: "XL Red" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_variant"];
      const result = await tool.handler({ product_id: 600, variant_id: 50, name: "XL Red", response_format: "markdown" });
      expect(result.content[0].text).toContain("Variant Updated");
      expect(mockRequest).toHaveBeenCalledWith("products/600/variants/50.json", "PATCH", expect.objectContaining({ name: "XL Red" }));
    });
  });

  describe("ir_get_dimensions", () => {
    it("lists dimensions", async () => {
      mockRequest.mockResolvedValueOnce([{ id: 1, name: "Size" }, { id: 2, name: "Color" }]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_dimensions"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Size");
      expect(result.content[0].text).toContain("Color");
    });
  });
});

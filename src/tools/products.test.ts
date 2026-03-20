import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_PRODUCT, createApiMock } from "../test-helpers.js";

const mockRequest = createApiMock();

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
      mockRequest.mockResolvedValueOnce([MOCK_PRODUCT]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_products"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Widget Pro");
      expect(result.content[0].text).toContain("WGT-001");
    });

    it("passes filter params", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_products"];
      await tool.handler({ name: "Widget", in_category: 5, with_variants: true, page: 1, response_format: "markdown" });
      expect(mockRequest).toHaveBeenCalledWith("products.json", "GET", undefined, {
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
});

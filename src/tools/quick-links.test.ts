import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_QUICK_LINK, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerQuickLinkTools } = await import("./quick-links.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerQuickLinkTools(server);
  return server;
}

describe("Quick Link Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_quick_links", () => {
    it("lists quick links", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_QUICK_LINK]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_quick_links"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Quick Link 400");
      expect(result.content[0].text).toContain("ir.example.com");
    });
  });

  describe("ir_get_user_quick_links", () => {
    it("lists quick links for a specific user", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_QUICK_LINK]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_user_quick_links"];
      const result = await tool.handler({ user_id: 42, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Quick Links for User 42");
      expect(result.content[0].text).toContain("Quick Link 400");
      expect(mockListRequest).toHaveBeenCalledWith("users/42/quick_links.json", { page: 1 });
    });

    it("handles empty results", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_user_quick_links"];
      const result = await tool.handler({ user_id: 99, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("No quick links found");
    });
  });

  describe("ir_create_quick_link", () => {
    it("creates a quick link for an asset", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_QUICK_LINK);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_quick_link"];
      const result = await tool.handler({ asset_id: 500, purpose: "download", response_format: "markdown" });
      expect(result.content[0].text).toContain("Quick Link Created");
      expect(mockRequest).toHaveBeenCalledWith("quick_links.json", "POST", { asset_id: 500, purpose: "download" });
    });

    it("passes image transformation params when provided", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_QUICK_LINK);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_quick_link"];
      await tool.handler({
        asset_id: 500,
        purpose: "embed",
        max_width: 800,
        max_height: 600,
        format: "jpg",
        dpi: 72,
        disposition: "inline",
        color_format: "rgb",
        expires: "2025-12-31",
        response_format: "json",
      });
      expect(mockRequest).toHaveBeenCalledWith("quick_links.json", "POST", {
        asset_id: 500,
        purpose: "embed",
        max_width: 800,
        max_height: 600,
        format: "jpg",
        dpi: 72,
        disposition: "inline",
        color_format: "rgb",
        expires: "2025-12-31",
      });
    });
  });

  describe("ir_delete_quick_link", () => {
    it("deletes a quick link", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_quick_link"];
      const result = await tool.handler({ quick_link_id: 400 });
      expect(result.content[0].text).toContain("deleted");
    });
  });
});

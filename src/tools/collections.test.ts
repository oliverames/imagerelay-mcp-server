import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_COLLECTION, MOCK_FILE, createApiMock } from "../test-helpers.js";

const mockRequest = createApiMock();

const { registerCollectionTools } = await import("./collections.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerCollectionTools(server);
  return server;
}

describe("Collection Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_collections", () => {
    it("lists collections", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_COLLECTION]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_collections"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Q1 Campaign");
      expect(result.content[0].text).toContain("ID: 200");
    });
  });

  describe("ir_get_collection", () => {
    it("gets a specific collection", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_COLLECTION);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_collection"];
      const result = await tool.handler({ collection_id: 200, response_format: "markdown" });
      expect(result.content[0].text).toContain("Q1 Campaign");
      expect(mockRequest).toHaveBeenCalledWith("collections/200.json");
    });
  });

  describe("ir_get_collection_files", () => {
    it("lists files in a collection", async () => {
      mockRequest.mockResolvedValueOnce([{ id: 500, name: "logo.png" }]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_collection_files"];
      const result = await tool.handler({ collection_id: 200, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("logo.png");
      expect(mockRequest).toHaveBeenCalledWith("collections/200/files.json", "GET", undefined, { page: 1 });
    });
  });

  describe("ir_create_collection", () => {
    it("creates a collection with asset IDs", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_COLLECTION, id: 201, name: "New Collection" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_collection"];
      const result = await tool.handler({ name: "New Collection", asset_ids: "500,501", response_format: "markdown" });
      expect(result.content[0].text).toContain("Collection Created");
      expect(mockRequest).toHaveBeenCalledWith("collections.json", "POST", { name: "New Collection", asset_ids: "500,501" });
    });
  });

  describe("ir_delete_collection", () => {
    it("deletes a collection", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_collection"];
      const result = await tool.handler({ collection_id: 200 });
      expect(result.content[0].text).toContain("deleted successfully");
    });
  });
});

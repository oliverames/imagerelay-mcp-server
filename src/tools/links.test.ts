import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiMock } from "../test-helpers.js";

const mockRequest = createApiMock();

const { registerLinkTools } = await import("./links.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerLinkTools(server);
  return server;
}

describe("Link Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_folder_links", () => {
    it("lists folder links", async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 1, uid: "fl-abc", folder_id: 100, created_at: "2024-01-01T00:00:00Z" },
      ]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_folder_links"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Link 1");
      expect(result.content[0].text).toContain("Folder 100");
    });
  });

  describe("ir_create_folder_link", () => {
    it("creates a folder link", async () => {
      mockRequest.mockResolvedValueOnce({ id: 2, uid: "fl-def", folder_id: 100 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_folder_link"];
      const result = await tool.handler({ folder_id: 100, response_format: "markdown" });
      expect(result.content[0].text).toContain("Folder Link Created");
      expect(mockRequest).toHaveBeenCalledWith("folder_links.json", "POST", { folder_id: 100 });
    });
  });

  describe("ir_delete_folder_link", () => {
    it("deletes a folder link", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_folder_link"];
      const result = await tool.handler({ folder_link_id: 1 });
      expect(result.content[0].text).toContain("deleted");
    });
  });

  describe("ir_get_upload_links", () => {
    it("lists upload links", async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 10, uid: "ul-abc", folder_id: 100, created_at: "2024-02-01T00:00:00Z" },
      ]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_upload_links"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Link 10");
    });
  });

  describe("ir_create_upload_link", () => {
    it("creates an upload link", async () => {
      mockRequest.mockResolvedValueOnce({ id: 11, uid: "ul-def", folder_id: 200 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_upload_link"];
      const result = await tool.handler({ folder_id: 200, response_format: "markdown" });
      expect(result.content[0].text).toContain("Upload Link Created");
      expect(mockRequest).toHaveBeenCalledWith("upload_links.json", "POST", { folder_id: 200 });
    });
  });

  describe("ir_delete_upload_link", () => {
    it("deletes an upload link", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_upload_link"];
      const result = await tool.handler({ upload_link_id: 10 });
      expect(result.content[0].text).toContain("deleted");
    });
  });
});

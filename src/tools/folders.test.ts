import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_FOLDER, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerFolderTools } = await import("./folders.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerFolderTools(server);
  return server;
}

describe("Folder Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_root_folder", () => {
    it("returns root folder", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_FOLDER, name: "Root", parent_id: null });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_root_folder"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Root");
      expect(mockRequest).toHaveBeenCalledWith("folders/root.json");
    });
  });

  describe("ir_get_folders", () => {
    it("lists folders with pagination", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_FOLDER]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_folders"];
      const result = await tool.handler({ page: 2, response_format: "markdown" });
      expect(result.content[0].text).toContain("Marketing Assets");
      expect(result.content[0].text).toContain("Page 2");
      expect(mockListRequest).toHaveBeenCalledWith("folders.json", { page: 2 });
    });
  });

  describe("ir_get_folder", () => {
    it("gets folder by ID", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FOLDER);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_folder"];
      const result = await tool.handler({ folder_id: 100, response_format: "markdown" });
      expect(result.content[0].text).toContain("Marketing Assets");
      expect(result.content[0].text).toContain("Files**: 25");
      expect(result.content[0].text).toContain("Subfolders**: 3");
    });
  });

  describe("ir_get_child_folders", () => {
    it("lists children of a folder", async () => {
      const child = { ...MOCK_FOLDER, id: 101, name: "Logos", parent_id: 100 };
      mockListRequest.mockResolvedValueOnce(paginatedResult([child]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_child_folders"];
      const result = await tool.handler({ folder_id: 100, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Logos");
      expect(mockListRequest).toHaveBeenCalledWith("folders/100/children.json", { page: 1 });
    });

    it("handles empty children", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_child_folders"];
      const result = await tool.handler({ folder_id: 100, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("No child folders");
    });
  });

  describe("ir_create_folder", () => {
    it("creates a folder", async () => {
      const newFolder = { ...MOCK_FOLDER, id: 150, name: "New Folder" };
      mockRequest.mockResolvedValueOnce(newFolder);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_folder"];
      const result = await tool.handler({ parent_id: 100, name: "New Folder", response_format: "markdown" });
      expect(result.content[0].text).toContain("Folder Created");
      expect(result.content[0].text).toContain("New Folder");
      expect(mockRequest).toHaveBeenCalledWith("folders.json", "POST", { parent_id: 100, name: "New Folder" });
    });
  });

  describe("ir_update_folder", () => {
    it("renames a folder", async () => {
      const updated = { ...MOCK_FOLDER, name: "Rebranded Assets" };
      mockRequest.mockResolvedValueOnce(updated);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_folder"];
      const result = await tool.handler({ folder_id: 100, name: "Rebranded Assets", response_format: "markdown" });
      expect(result.content[0].text).toContain("Rebranded Assets");
      expect(mockRequest).toHaveBeenCalledWith("folders/100.json", "PUT", { name: "Rebranded Assets" });
    });
  });

  describe("ir_delete_folder", () => {
    it("deletes a folder", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_folder"];
      const result = await tool.handler({ folder_id: 100 });
      expect(result.content[0].text).toContain("deleted successfully");
      expect(mockRequest).toHaveBeenCalledWith("folders/100.json", "DELETE");
    });
  });
});

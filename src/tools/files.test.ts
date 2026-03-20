import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_FILE, createApiMock } from "../test-helpers.js";

const mockRequest = createApiMock();

const { registerFileTools } = await import("./files.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerFileTools(server);
  return server;
}

describe("File Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_files", () => {
    it("lists files in a folder", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_FILE]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_files"];
      const result = await tool.handler({
        folder_id: 100,
        page: 1,
        recursive: false,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("logo.png");
      expect(result.content[0].text).toContain("240.0 KB");
      expect(result.content[0].text).toContain("1200x800");
      expect(mockRequest).toHaveBeenCalledWith(
        "folders/100/files.json",
        "GET",
        undefined,
        { page: 1 }
      );
    });

    it("passes all filter params", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_files"];
      await tool.handler({
        folder_id: 100,
        page: 1,
        recursive: true,
        uploaded_after: "2024-01-01",
        file_type_id: 10,
        query: "logo",
        response_format: "markdown",
      });
      expect(mockRequest).toHaveBeenCalledWith(
        "folders/100/files.json",
        "GET",
        undefined,
        {
          page: 1,
          uploaded_after: "2024-01-01",
          file_type_id: 10,
          recursive: true,
          query: "logo",
        }
      );
    });

    it("shows metadata terms in markdown", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_FILE]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_files"];
      const result = await tool.handler({
        folder_id: 100,
        page: 1,
        recursive: false,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("Brand Logo");
    });

    it("returns JSON with all fields", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_FILE]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_files"];
      const result = await tool.handler({
        folder_id: 100,
        page: 1,
        recursive: false,
        response_format: "json",
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(500);
      expect(parsed[0].content_type).toBe("image/png");
    });
  });

  describe("ir_get_file", () => {
    it("gets a specific file", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FILE);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_file"];
      const result = await tool.handler({ folder_id: 100, file_id: 500, response_format: "markdown" });
      expect(result.content[0].text).toContain("logo.png");
      expect(mockRequest).toHaveBeenCalledWith("folders/100/files/500.json");
    });
  });

  describe("ir_upload_file_from_url", () => {
    it("uploads a file from URL", async () => {
      const uploaded = { ...MOCK_FILE, id: 501, name: "banner.jpg" };
      mockRequest.mockResolvedValueOnce(uploaded);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_upload_file_from_url"];
      const result = await tool.handler({
        filename: "banner.jpg",
        folder_id: 100,
        file_type_id: 10,
        url: "https://example.com/banner.jpg",
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("File Uploaded");
      expect(result.content[0].text).toContain("banner.jpg");
      expect(mockRequest).toHaveBeenCalledWith("files.json", "POST", {
        filename: "banner.jpg",
        folder_id: 100,
        file_type_id: 10,
        url: "https://example.com/banner.jpg",
        terms: null,
      });
    });

    it("includes terms and keyword_ids when provided", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FILE);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_upload_file_from_url"];
      await tool.handler({
        filename: "logo.png",
        folder_id: 100,
        file_type_id: 10,
        url: "https://example.com/logo.png",
        terms: [{ term_id: 1, value: "Brand" }],
        keyword_ids: [5, 10],
        response_format: "json",
      });
      expect(mockRequest).toHaveBeenCalledWith("files.json", "POST", {
        filename: "logo.png",
        folder_id: 100,
        file_type_id: 10,
        url: "https://example.com/logo.png",
        terms: [{ term_id: 1, value: "Brand" }],
        keyword_ids: [5, 10],
      });
    });
  });

  describe("ir_move_file", () => {
    it("moves a file to another folder", async () => {
      const moved = { ...MOCK_FILE, folder_ids: [200] };
      mockRequest.mockResolvedValueOnce(moved);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_move_file"];
      const result = await tool.handler({ file_id: 500, folder_id: 200, response_format: "markdown" });
      expect(result.content[0].text).toContain("File Moved");
      expect(mockRequest).toHaveBeenCalledWith("files/500/move.json", "POST", { folder_id: 200 });
    });
  });

  describe("ir_delete_file", () => {
    it("deletes a file", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_file"];
      const result = await tool.handler({ file_id: 500 });
      expect(result.content[0].text).toContain("deleted successfully");
    });
  });

  describe("ir_get_file_types", () => {
    it("lists file types", async () => {
      mockRequest.mockResolvedValueOnce([
        { id: 10, name: "Photo" },
        { id: 20, name: "Document" },
      ]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_file_types"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Photo");
      expect(result.content[0].text).toContain("ID: 10");
      expect(result.content[0].text).toContain("Document");
    });
  });
});

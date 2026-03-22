import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_FILE, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

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
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_FILE]));
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
      expect(mockListRequest).toHaveBeenCalledWith(
        "folders/100/files.json",
        { page: 1 }
      );
    });

    it("passes all filter params", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([]));
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
      expect(mockListRequest).toHaveBeenCalledWith(
        "folders/100/files.json",
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
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_FILE]));
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
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_FILE]));
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

  describe("ir_update_file_metadata", () => {
    it("updates metadata terms with overwrite", async () => {
      const updated = { ...MOCK_FILE, terms: [{ term_id: 1, value: "New Value" }] };
      mockRequest.mockResolvedValueOnce(updated);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_file_metadata"];
      const result = await tool.handler({
        file_id: 500,
        terms: [{ term_id: 1, value: "New Value" }],
        overwrite: true,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("File Metadata Updated");
      expect(mockRequest).toHaveBeenCalledWith("files/500/terms.json", "POST", {
        terms: [{ term_id: 1, value: "New Value" }],
        overwrite: true,
      });
    });

    it("defaults overwrite to false", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FILE);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_file_metadata"];
      await tool.handler({
        file_id: 500,
        terms: [{ term_id: 1, value: "Appended" }],
        overwrite: false,
        response_format: "markdown",
      });
      expect(mockRequest).toHaveBeenCalledWith("files/500/terms.json", "POST", {
        terms: [{ term_id: 1, value: "Appended" }],
        overwrite: false,
      });
    });
  });

  describe("ir_update_file_tags", () => {
    it("adds and removes tags", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FILE);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_file_tags"];
      const result = await tool.handler({
        file_id: 500,
        add: [10, 20],
        remove: [5],
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("File Tags Updated");
      expect(mockRequest).toHaveBeenCalledWith("files/500/tags.json", "POST", {
        tags: { add: [10, 20], remove: [5] },
      });
    });
  });

  describe("ir_move_file", () => {
    it("moves a file to folders using folder_ids array", async () => {
      const moved = { ...MOCK_FILE, folder_ids: [200] };
      mockRequest.mockResolvedValueOnce(moved);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_move_file"];
      const result = await tool.handler({ file_id: 500, folder_ids: ["200"], response_format: "markdown" });
      expect(result.content[0].text).toContain("File Moved");
      expect(mockRequest).toHaveBeenCalledWith("files/500/move.json", "POST", { folder_ids: ["200"] });
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

  describe("ir_duplicate_file", () => {
    it("duplicates a file to another folder", async () => {
      const duplicated = { ...MOCK_FILE, id: 501 };
      mockRequest.mockResolvedValueOnce(duplicated);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_duplicate_file"];
      const result = await tool.handler({
        file_id: 500,
        folder_id: "200",
        should_copy_metadata: true,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("File Duplicated");
      expect(mockRequest).toHaveBeenCalledWith("files/500/dupicate.json", "POST", {
        folder_id: "200",
        should_copy_metadata: true,
      });
    });

    it("defaults should_copy_metadata to true", async () => {
      mockRequest.mockResolvedValueOnce({ ...MOCK_FILE, id: 502 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_duplicate_file"];
      await tool.handler({
        file_id: 500,
        folder_id: "200",
        should_copy_metadata: true,
        response_format: "markdown",
      });
      expect(mockRequest).toHaveBeenCalledWith(
        "files/500/dupicate.json",
        "POST",
        expect.objectContaining({ should_copy_metadata: true })
      );
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

  describe("ir_get_file_type", () => {
    it("gets a single file type", async () => {
      mockRequest.mockResolvedValueOnce({ id: 10, name: "Photo" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_file_type"];
      const result = await tool.handler({ file_type_id: 10, response_format: "markdown" });
      expect(result.content[0].text).toContain("Photo");
      expect(mockRequest).toHaveBeenCalledWith("file_types/10.json");
    });
  });

  describe("ir_create_synced_file", () => {
    it("creates a synced file across folders", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_FILE);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_synced_file"];
      const result = await tool.handler({ file_id: 500, folder_ids: ["200", "300"], response_format: "markdown" });
      expect(result.content[0].text).toContain("Synced File Created");
      expect(mockRequest).toHaveBeenCalledWith("files/500/synced_file.json", "POST", { folder_ids: ["200", "300"] });
    });
  });

  describe("ir_create_upload_job", () => {
    it("creates an upload job", async () => {
      const mockJob = { id: 999, files: [{ id: 1001 }] };
      mockRequest.mockResolvedValueOnce(mockJob);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_upload_job"];
      const result = await tool.handler({
        folder_id: 100,
        file_type_id: 10,
        file_name: "video.mp4",
        file_size: 50000000,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("Upload Job Created");
      expect(result.content[0].text).toContain("999");
      expect(result.content[0].text).toContain("1001");
      expect(mockRequest).toHaveBeenCalledWith("upload_jobs.json", "POST", {
        folder_id: 100,
        file_type_id: 10,
        files: [{ file_name: "video.mp4", file_size: 50000000 }],
      });
    });

    it("passes optional params when provided", async () => {
      mockRequest.mockResolvedValueOnce({ id: 999, files: [{ id: 1001 }] });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_upload_job"];
      await tool.handler({
        folder_id: 100,
        file_type_id: 10,
        file_name: "video.mp4",
        file_size: 50000000,
        prefix: "subfolder",
        terms: [{ term_id: 1, value: "Test" }],
        expires_on: "2025-12-31",
        keyword_ids: [5, 10],
        response_format: "json",
      });
      expect(mockRequest).toHaveBeenCalledWith("upload_jobs.json", "POST", {
        folder_id: 100,
        file_type_id: 10,
        files: [{ file_name: "video.mp4", file_size: 50000000 }],
        prefix: "subfolder",
        terms: [{ term_id: 1, value: "Test" }],
        expires_on: "2025-12-31",
        keyword_ids: [5, 10],
      });
    });
  });

  describe("ir_check_upload_job_status", () => {
    it("shows processing status", async () => {
      mockRequest.mockResolvedValueOnce({ id: 999, finished: null, asset_id: null });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_check_upload_job_status"];
      const result = await tool.handler({ upload_job_id: 999, response_format: "markdown" });
      expect(result.content[0].text).toContain("Processing");
      expect(mockRequest).toHaveBeenCalledWith("upload_jobs/999.json");
    });

    it("shows complete status with asset_id", async () => {
      mockRequest.mockResolvedValueOnce({ id: 999, finished: true, asset_id: 500 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_check_upload_job_status"];
      const result = await tool.handler({ upload_job_id: 999, response_format: "markdown" });
      expect(result.content[0].text).toContain("Complete");
      expect(result.content[0].text).toContain("500");
    });
  });

  describe("ir_create_file_version", () => {
    it("creates a file version and returns UUID", async () => {
      mockRequest.mockResolvedValueOnce({ uuid: "abc-def-ghi-jkl" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_file_version"];
      const result = await tool.handler({ file_id: 500, response_format: "markdown" });
      expect(result.content[0].text).toContain("abc-def-ghi-jkl");
      expect(result.content[0].text).toContain("Version Upload Started");
      expect(mockRequest).toHaveBeenCalledWith("files/500/versions.json", "POST");
    });
  });

  describe("ir_complete_file_version", () => {
    it("completes a file version upload", async () => {
      mockRequest.mockResolvedValueOnce({ status: "processing" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_complete_file_version"];
      const result = await tool.handler({
        file_id: 500,
        v4_uuid: "abc-def-ghi-jkl",
        file_name: "image.png",
        chunk_count: 3,
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("Version Upload Complete");
      expect(mockRequest).toHaveBeenCalledWith(
        "files/500/versions/abc-def-ghi-jkl/complete.json",
        "POST",
        { file_name: "image.png", chunk_count: 3 }
      );
    });
  });
});

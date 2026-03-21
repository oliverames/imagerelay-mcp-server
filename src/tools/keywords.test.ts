import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerKeywordTools } = await import("./keywords.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerKeywordTools(server);
  return server;
}

describe("Keyword Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_keyword_sets", () => {
    it("lists keyword sets", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([
        { id: 1, name: "Colors" },
        { id: 2, name: "Seasons" },
      ]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_keyword_sets"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Colors");
      expect(result.content[0].text).toContain("Seasons");
    });
  });

  describe("ir_get_keywords", () => {
    it("lists keywords in a set", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([
        { id: 10, name: "Red", keyword_set_id: 1 },
        { id: 11, name: "Blue", keyword_set_id: 1 },
      ]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_keywords"];
      const result = await tool.handler({ keyword_set_id: 1, page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Red");
      expect(result.content[0].text).toContain("Blue");
      expect(mockListRequest).toHaveBeenCalledWith("keyword_sets/1/keywords.json", { page: 1 });
    });
  });

  describe("ir_create_keyword_set", () => {
    it("creates a keyword set", async () => {
      mockRequest.mockResolvedValueOnce({ id: 3, name: "Materials" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_keyword_set"];
      const result = await tool.handler({ name: "Materials", response_format: "markdown" });
      expect(result.content[0].text).toContain("Keyword Set Created");
      expect(result.content[0].text).toContain("Materials");
    });
  });

  describe("ir_create_keyword", () => {
    it("creates a keyword in a set", async () => {
      mockRequest.mockResolvedValueOnce({ id: 20, name: "Green", keyword_set_id: 1 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_keyword"];
      const result = await tool.handler({ keyword_set_id: 1, name: "Green", response_format: "markdown" });
      expect(result.content[0].text).toContain("Keyword Created");
      expect(result.content[0].text).toContain("Green");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1/keywords.json", "POST", { name: "Green" });
    });
  });

  describe("ir_delete_keyword", () => {
    it("deletes a keyword", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_keyword"];
      const result = await tool.handler({ keyword_set_id: 1, keyword_id: 10 });
      expect(result.content[0].text).toContain("deleted");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1/keywords/10.json", "DELETE");
    });
  });

  describe("ir_get_keyword_set", () => {
    it("gets a single keyword set", async () => {
      mockRequest.mockResolvedValueOnce({ id: 1, name: "Colors" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_keyword_set"];
      const result = await tool.handler({ keyword_set_id: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Colors");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1.json");
    });
  });

  describe("ir_get_keyword", () => {
    it("gets a single keyword", async () => {
      mockRequest.mockResolvedValueOnce({ id: 10, name: "Red", keyword_set_id: 1 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_keyword"];
      const result = await tool.handler({ keyword_set_id: 1, keyword_id: 10, response_format: "markdown" });
      expect(result.content[0].text).toContain("Red");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1/keywords/10.json");
    });
  });

  describe("ir_update_keyword_set", () => {
    it("updates a keyword set name", async () => {
      mockRequest.mockResolvedValueOnce({ id: 1, name: "Shades" });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_keyword_set"];
      const result = await tool.handler({ keyword_set_id: 1, name: "Shades", response_format: "markdown" });
      expect(result.content[0].text).toContain("Updated");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1.json", "PUT", { name: "Shades" });
    });
  });

  describe("ir_update_keyword", () => {
    it("updates a keyword name", async () => {
      mockRequest.mockResolvedValueOnce({ id: 10, name: "Crimson", keyword_set_id: 1 });
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_keyword"];
      const result = await tool.handler({ keyword_set_id: 1, keyword_id: 10, name: "Crimson", response_format: "markdown" });
      expect(result.content[0].text).toContain("Updated");
      expect(mockRequest).toHaveBeenCalledWith("keyword_sets/1/keywords/10.json", "PUT", { name: "Crimson" });
    });
  });
});

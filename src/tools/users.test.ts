import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_USER, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

// Import after mocking
const { registerUserTools } = await import("./users.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerUserTools(server);
  return server;
}

describe("User Tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ir_get_me", () => {
    it("returns authenticated user in markdown", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_USER);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_me"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("Jane Doe");
      expect(result.content[0].text).toContain("ID: 42");
      expect(result.content[0].text).toContain("jane@example.com");
      expect(mockRequest).toHaveBeenCalledWith("users/me.json");
    });

    it("returns authenticated user in JSON", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_USER);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_me"];
      const result = await tool.handler({ response_format: "json" });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe(42);
      expect(parsed.email).toBe("jane@example.com");
    });

    it("returns error on failure", async () => {
      mockRequest.mockRejectedValueOnce(new Error("Network fail"));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_me"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error");
    });
  });

  describe("ir_get_users", () => {
    it("returns paginated user list", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_USER, { ...MOCK_USER, id: 43, first_name: "John" }]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_users"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("Jane Doe");
      expect(result.content[0].text).toContain("John");
      expect(result.content[0].text).toContain("Page 1");
      expect(mockListRequest).toHaveBeenCalledWith("users.json", { page: 1 });
    });

    it("returns empty message when no users", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_users"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("No users found");
    });
  });

  describe("ir_get_user", () => {
    it("fetches a specific user by ID", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_USER);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_user"];
      const result = await tool.handler({ user_id: 42, response_format: "markdown" });
      expect(result.content[0].text).toContain("Jane Doe");
      expect(mockRequest).toHaveBeenCalledWith("users/42.json");
    });
  });

  describe("ir_search_users", () => {
    it("searches by email", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_USER]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_search_users"];
      const result = await tool.handler({ email: "jane@example.com", response_format: "markdown" });
      expect(result.content[0].text).toContain("1 users");
      expect(mockRequest).toHaveBeenCalledWith("users/search.json", "GET", undefined, { email: "jane@example.com" });
    });

    it("searches by first and last name", async () => {
      mockRequest.mockResolvedValueOnce([MOCK_USER]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_search_users"];
      await tool.handler({ first_name: "Jane", last_name: "Doe", response_format: "markdown" });
      expect(mockRequest).toHaveBeenCalledWith("users/search.json", "GET", undefined, {
        first_name: "Jane",
        last_name: "Doe",
      });
    });

    it("returns empty result message", async () => {
      mockRequest.mockResolvedValueOnce([]);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_search_users"];
      const result = await tool.handler({ email: "nobody@example.com", response_format: "markdown" });
      expect(result.content[0].text).toContain("No users found");
    });
  });
});

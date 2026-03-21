import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_WEBHOOK, createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerWebhookTools } = await import("./webhooks.js");
const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");

function createServer() {
  const server = new McpServer({ name: "test", version: "0.0.1" });
  registerWebhookTools(server);
  return server;
}

describe("Webhook Tools", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("ir_get_supported_webhooks", () => {
    it("returns supported events", async () => {
      const events = { file: ["created", "deleted"], folder: ["created"] };
      mockRequest.mockResolvedValueOnce(events);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_supported_webhooks"];
      const result = await tool.handler({ response_format: "markdown" });
      expect(result.content[0].text).toContain("created");
      expect(result.content[0].text).toContain("deleted");
    });
  });

  describe("ir_get_webhooks", () => {
    it("lists configured webhooks", async () => {
      mockListRequest.mockResolvedValueOnce(paginatedResult([MOCK_WEBHOOK]));
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_webhooks"];
      const result = await tool.handler({ page: 1, response_format: "markdown" });
      expect(result.content[0].text).toContain("file");
      expect(result.content[0].text).toContain("created");
      expect(result.content[0].text).toContain("hooks.example.com");
    });
  });

  describe("ir_create_webhook", () => {
    it("creates a webhook", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_WEBHOOK);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_create_webhook"];
      const result = await tool.handler({
        resource: "file",
        action: "created",
        url: "https://hooks.example.com/ir",
        notification_emails: ["ops@example.com"],
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("Webhook Created");
      expect(mockRequest).toHaveBeenCalledWith("webhooks.json", "POST", {
        resource: "file",
        action: "created",
        url: "https://hooks.example.com/ir",
        notification_emails: ["ops@example.com"],
      });
    });
  });

  describe("ir_update_webhook", () => {
    it("updates webhook URL", async () => {
      const updated = { ...MOCK_WEBHOOK, url: "https://new.example.com/hook" };
      mockRequest.mockResolvedValueOnce(updated);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_update_webhook"];
      const result = await tool.handler({
        webhook_id: 300,
        url: "https://new.example.com/hook",
        response_format: "markdown",
      });
      expect(result.content[0].text).toContain("new.example.com");
      expect(mockRequest).toHaveBeenCalledWith("webhooks/300.json", "PUT", {
        url: "https://new.example.com/hook",
      });
    });
  });

  describe("ir_delete_webhook", () => {
    it("deletes a webhook", async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_delete_webhook"];
      const result = await tool.handler({ webhook_id: 300 });
      expect(result.content[0].text).toContain("deleted");
    });
  });

  describe("ir_get_webhook", () => {
    it("gets a single webhook", async () => {
      mockRequest.mockResolvedValueOnce(MOCK_WEBHOOK);
      const server = createServer();
      const tool = (server as any)._registeredTools["ir_get_webhook"];
      const result = await tool.handler({ webhook_id: 300, response_format: "markdown" });
      expect(result.content[0].text).toContain("file");
      expect(result.content[0].text).toContain("created");
      expect(mockRequest).toHaveBeenCalledWith("webhooks/300.json");
    });
  });
});

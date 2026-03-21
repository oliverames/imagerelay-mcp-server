import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerPermissionTools } = await import("./permissions.js");

const MOCK_PERMISSION = { id: 5, name: "Admin" };

function createServer() {
  const tools = new Map<string, Function>();
  return {
    registerTool: (name: string, _opts: unknown, handler: Function) => {
      tools.set(name, handler);
    },
    call: (name: string, params: Record<string, unknown>) => {
      const fn = tools.get(name);
      if (!fn) throw new Error(`Tool ${name} not registered`);
      return fn(params);
    },
  };
}

describe("permissions tools", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    server = createServer();
    registerPermissionTools(server as any);
  });

  it("ir_get_permissions lists permissions", async () => {
    mockListRequest.mockResolvedValue(paginatedResult([MOCK_PERMISSION]));
    const result = await server.call("ir_get_permissions", { page: 1, response_format: "markdown" });
    expect(result.content[0].text).toContain("Admin");
  });

  it("ir_get_permission gets a single permission", async () => {
    mockRequest.mockResolvedValue(MOCK_PERMISSION);
    const result = await server.call("ir_get_permission", { permission_id: 5, response_format: "markdown" });
    expect(result.content[0].text).toContain("Admin");
  });

  it("ir_update_user_permission updates user permission", async () => {
    mockRequest.mockResolvedValue({});
    const result = await server.call("ir_update_user_permission", { user_id: 42, permission_id: 5, response_format: "markdown" });
    expect(result.content[0].text).toContain("Permission Updated");
    expect(mockRequest).toHaveBeenCalledWith("users/42.json", "PUT", { role_id: 5 });
  });
});

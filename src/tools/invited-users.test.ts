import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiMock, paginatedResult } from "../test-helpers.js";

const { mockRequest, mockListRequest } = createApiMock();

const { registerInvitedUserTools } = await import("./invited-users.js");

const MOCK_INVITED_USER = {
  id: 10,
  email: "new@example.com",
  first_name: "New",
  last_name: "User",
  company: "Test Corp",
  permission_id: 3,
  created_on: "2024-06-01T00:00:00Z",
};

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

describe("invited-users tools", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    server = createServer();
    registerInvitedUserTools(server as any);
  });

  it("ir_get_invited_users lists invited users", async () => {
    mockListRequest.mockResolvedValue(paginatedResult([MOCK_INVITED_USER]));
    const result = await server.call("ir_get_invited_users", { page: 1, response_format: "markdown" });
    expect(result.content[0].text).toContain("New User");
    expect(mockListRequest).toHaveBeenCalledWith("invited_users.json", { page: 1 });
  });

  it("ir_get_invited_user gets a single invited user", async () => {
    mockRequest.mockResolvedValue(MOCK_INVITED_USER);
    const result = await server.call("ir_get_invited_user", { invited_user_id: 10, response_format: "markdown" });
    expect(result.content[0].text).toContain("New User");
  });

  it("ir_invite_user invites a new user", async () => {
    mockRequest.mockResolvedValue(MOCK_INVITED_USER);
    const result = await server.call("ir_invite_user", {
      first_name: "New",
      last_name: "User",
      email: "new@example.com",
      permission_id: 3,
      response_format: "markdown",
    });
    expect(result.content[0].text).toContain("User Invited");
    expect(mockRequest).toHaveBeenCalledWith("invited_users.json", "POST", expect.objectContaining({ email: "new@example.com" }));
  });

  it("ir_invite_user passes custom fields when provided", async () => {
    mockRequest.mockResolvedValue(MOCK_INVITED_USER);
    await server.call("ir_invite_user", {
      first_name: "New",
      last_name: "User",
      email: "new@example.com",
      permission_id: 3,
      custom_field_one: "Department A",
      custom_field_three: "Region West",
      response_format: "markdown",
    });
    expect(mockRequest).toHaveBeenCalledWith("invited_users.json", "POST",
      expect.objectContaining({
        custom_field_one: "Department A",
        custom_field_three: "Region West",
      })
    );
  });

  it("ir_delete_invited_user deletes an invited user", async () => {
    mockRequest.mockResolvedValue(undefined);
    const result = await server.call("ir_delete_invited_user", { invited_user_id: 10 });
    expect(result.content[0].text).toContain("deleted");
  });

  it("ir_create_sso_user creates an SSO user", async () => {
    mockRequest.mockResolvedValue(MOCK_INVITED_USER);
    const result = await server.call("ir_create_sso_user", {
      first_name: "New",
      last_name: "User",
      email: "new@example.com",
      permission_id: 3,
      response_format: "markdown",
    });
    expect(result.content[0].text).toContain("SSO User Created");
    expect(mockRequest).toHaveBeenCalledWith("users/sso_user.json", "POST", expect.objectContaining({ role_id: "3" }));
  });
});

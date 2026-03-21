import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiMock } from "../test-helpers.js";

const { mockRequest } = createApiMock();

const { registerCustomAttributeTools } = await import("./custom-attributes.js");

const MOCK_ATTR = { id: 1, name: "Color" };

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

describe("custom-attributes tools", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    server = createServer();
    registerCustomAttributeTools(server as any);
  });

  it("ir_get_custom_attributes lists attributes", async () => {
    mockRequest.mockResolvedValue([MOCK_ATTR]);
    const result = await server.call("ir_get_custom_attributes", { response_format: "markdown" });
    expect(result.content[0].text).toContain("Color");
  });

  it("ir_get_custom_attribute gets one attribute", async () => {
    mockRequest.mockResolvedValue(MOCK_ATTR);
    const result = await server.call("ir_get_custom_attribute", { attribute_id: 1, response_format: "markdown" });
    expect(result.content[0].text).toContain("Color");
  });

  it("ir_create_custom_attribute creates an attribute", async () => {
    mockRequest.mockResolvedValue(MOCK_ATTR);
    const result = await server.call("ir_create_custom_attribute", { name: "Color", response_format: "markdown" });
    expect(result.content[0].text).toContain("Created");
  });

  it("ir_update_custom_attribute updates an attribute", async () => {
    mockRequest.mockResolvedValue({ ...MOCK_ATTR, name: "Size" });
    const result = await server.call("ir_update_custom_attribute", { attribute_id: 1, name: "Size", response_format: "markdown" });
    expect(result.content[0].text).toContain("Updated");
  });
});

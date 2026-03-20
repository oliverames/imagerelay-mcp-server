import { vi } from "vitest";

/**
 * Mock axios module. Call this before importing any tool module.
 * Returns a mock function that controls what apiRequest returns.
 */
export function createApiMock() {
  const mockRequest = vi.fn();

  // Mock the api-client module
  vi.doMock("./services/api-client.js", () => ({
    apiRequest: mockRequest,
    handleApiError: (error: unknown) => {
      if (error instanceof Error) return `Error: ${error.message}`;
      return `Error: ${String(error)}`;
    },
    resetClient: vi.fn(),
  }));

  return mockRequest;
}

/** Standard mock user object */
export const MOCK_USER = {
  id: 42,
  login: "jdoe",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  company: "Acme Corp",
  created_on: "2024-01-15T00:00:00Z",
  updated_on: "2024-06-01T00:00:00Z",
  permission_id: 5,
};

/** Standard mock folder object */
export const MOCK_FOLDER = {
  id: 100,
  name: "Marketing Assets",
  parent_id: 1,
  created_on: "2024-02-01T00:00:00Z",
  updated_on: "2024-06-15T00:00:00Z",
  user_id: 42,
  full_path: "/Root/Marketing Assets",
  child_count: 3,
  file_count: 25,
  permission_ids: [1, 2],
};

/** Standard mock file object */
export const MOCK_FILE = {
  id: 500,
  name: "logo.png",
  content_type: "image/png",
  size: 245760,
  width: 1200,
  height: 800,
  created_at: "2024-03-01T00:00:00Z",
  updated_on: "2024-03-15T00:00:00Z",
  deleted: false,
  user_id: 42,
  expires_on: null,
  file_type_id: 10,
  terms: [{ term_id: 1, value: "Brand Logo" }],
  folders: ["/Root/Marketing Assets"],
  folder_ids: [100],
  permission_ids: [1],
};

/** Standard mock collection object */
export const MOCK_COLLECTION = {
  id: 200,
  name: "Q1 Campaign",
  created_on: "2024-01-10T00:00:00Z",
  updated_on: "2024-03-20T00:00:00Z",
  user_id: 42,
};

/** Standard mock webhook object */
export const MOCK_WEBHOOK = {
  id: 300,
  resource: "file",
  action: "created",
  url: "https://hooks.example.com/ir",
  notification_emails: ["ops@example.com"],
};

/** Standard mock quick link */
export const MOCK_QUICK_LINK = {
  id: 400,
  uid: "abc123",
  purpose: "download",
  processing: false,
  created_at: "2024-04-01T00:00:00Z",
  updated_at: "2024-04-01T00:00:00Z",
  asset_id: 500,
  user_id: 42,
  url: "https://ir.example.com/ql/abc123",
};

/** Standard mock product */
export const MOCK_PRODUCT = {
  id: 600,
  name: "Widget Pro",
  sku: "WGT-001",
  created_at: "2024-05-01T00:00:00Z",
  updated_at: "2024-05-15T00:00:00Z",
};

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      IMAGERELAY_API_KEY: "test-api-key-for-testing",
    },
  },
});

#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerUserTools } from "./tools/users.js";
import { registerFolderTools } from "./tools/folders.js";
import { registerFileTools } from "./tools/files.js";
import { registerCollectionTools } from "./tools/collections.js";
import { registerQuickLinkTools } from "./tools/quick-links.js";
import { registerKeywordTools } from "./tools/keywords.js";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerProductTools } from "./tools/products.js";
import { registerLinkTools } from "./tools/links.js";

const server = new McpServer({
  name: "imagerelay-mcp-server",
  version: "1.0.0",
});

// Register all tool domains
registerUserTools(server);
registerFolderTools(server);
registerFileTools(server);
registerCollectionTools(server);
registerQuickLinkTools(server);
registerKeywordTools(server);
registerWebhookTools(server);
registerProductTools(server);
registerLinkTools(server);

async function main(): Promise<void> {
  if (!process.env.IMAGERELAY_API_KEY) {
    console.error(
      "ERROR: IMAGERELAY_API_KEY environment variable is required.\n" +
        "Generate one in Image Relay: My Account > API Keys."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("imagerelay-mcp-server running via stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

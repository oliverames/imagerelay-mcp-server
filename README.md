<p align="center">
  <img src="assets/icon.png" width="80" height="80" alt="Image Relay">
</p>

<h1 align="center">Image Relay MCP Server</h1>

<p align="center">
  <strong>The complete Model Context Protocol server for Image Relay's digital asset management platform.</strong><br/>
  101 tools spanning files, folders, collections, products, users, permissions, and more.
</p>

<p align="center">
  <code>101 tools</code> &bull;
  <code>full API v2 coverage</code> &bull;
  <code>DAM + PIM</code>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/imagerelay-mcp-server"><img src="https://img.shields.io/npm/v/imagerelay-mcp-server?style=flat-square&color=f5a542" alt="npm"></a>
  <a href="https://github.com/oliverames/imagerelay-mcp-server/releases/tag/v2.0.2"><img src="https://img.shields.io/github/v/release/oliverames/imagerelay-mcp-server?style=flat-square&color=f5a542&label=MCPB" alt="MCPB release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-f5a542?style=flat-square" alt="License"></a>
  <a href="https://www.buymeacoffee.com/oliverames"><img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=flat-square&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#install-with-mcpb">MCPB Download</a> &bull;
  <a href="#complete-tool-reference">All 101 Tools</a> &bull;
  <a href="#environment-variables">Configuration</a> &bull;
  <a href="#api-coverage">API Coverage</a>
</p>

---

## Why This Exists

Digital asset management is the backbone of brand operations — but DAM platforms like Image Relay are designed for human workflows, not programmatic access. Finding the right asset means navigating folder trees, applying filters, and manually downloading files. Uploading a batch of assets means repetitive form-filling.

This server gives your AI assistant full access to your Image Relay DAM through natural language. Browse folders, search files, upload assets, manage metadata, organize collections, administer users, and configure webhooks — all through conversation. Built on the [Model Context Protocol](https://modelcontextprotocol.io), it works with Claude Desktop, Claude Code, and any MCP-compatible client.

## Quick Start

### Install with MCPB

For Claude Desktop and other MCPB-compatible clients, download the local bundle from the [v2.0.2 release](https://github.com/oliverames/imagerelay-mcp-server/releases/tag/v2.0.2):

[Download `imagerelay-mcp-server-2.0.2.mcpb`](https://github.com/oliverames/imagerelay-mcp-server/releases/download/v2.0.2/imagerelay-mcp-server-2.0.2.mcpb)

The bundle includes the Image Relay favicon, production runtime dependencies, and setup prompts for your API key and optional subdomain.

### 1. Get an API Key

In Image Relay, go to **My Account > API Keys** and generate a new key.

### 2. Install

**Claude Desktop** — add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "imagerelay": {
      "command": "npx",
      "args": ["-y", "imagerelay-mcp-server"],
      "env": {
        "IMAGERELAY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Claude Code** — add to your `~/.claude.json` or project settings:

```json
{
  "mcpServers": {
    "imagerelay": {
      "command": "npx",
      "args": ["-y", "imagerelay-mcp-server"],
      "env": {
        "IMAGERELAY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 3. Start talking to your DAM

> "Show me what's in the Marketing Assets folder"
>
> "Upload this logo from URL to the Brand folder with the Photo metadata template"
>
> "Find all files uploaded after January 2024 in the Product Images folder"
>
> "Create a collection called Q2 Campaign and add these assets to it"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IMAGERELAY_API_KEY` | Yes | Your Image Relay API key (Bearer token) |
| `IMAGERELAY_SUBDOMAIN` | No | Custom subdomain if not using `api.imagerelay.com` |

### 1Password Integration

If `IMAGERELAY_API_KEY` is not set in the environment, the server automatically attempts to resolve it from [1Password CLI](https://developer.1password.com/docs/cli/):

```
op://Development/Image Relay API Key/credential
```

This means you can skip setting the env var entirely if you have `op` installed and a service account or session active. The fallback adds ~1-2s to startup and is silently skipped if 1Password is unavailable.

## Complete Tool Reference

### Library Management

<details>
<summary><strong>Files</strong> — 15 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_files` | List files in a folder with filters (date, type, search, recursive) |
| `ir_get_file` | Get full details for a specific file |
| `ir_upload_file_from_url` | Upload a file by providing a source URL |
| `ir_update_file_metadata` | Update metadata terms on a file (append or overwrite) |
| `ir_update_file_tags` | Add or remove keyword tags on a file |
| `ir_move_file` | Move a file to one or more folders |
| `ir_duplicate_file` | Copy a file to another folder with optional metadata |
| `ir_create_synced_file` | Create synced copies across multiple folders |
| `ir_delete_file` | Delete a file |
| `ir_get_file_types` | List all metadata templates |
| `ir_get_file_type` | Get a specific metadata template |
| `ir_create_upload_job` | Create a chunked upload job for large files |
| `ir_check_upload_job_status` | Check the status of a chunked upload job |
| `ir_create_file_version` | Start a version update (get upload UUID) |
| `ir_complete_file_version` | Complete a file version upload after chunks are sent |

</details>

<details>
<summary><strong>Folders</strong> — 7 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_root_folder` | Get the root folder (starting point for navigation) |
| `ir_get_folders` | List all folders with pagination |
| `ir_get_folder` | Get details for a specific folder |
| `ir_get_child_folders` | List immediate children of a folder |
| `ir_create_folder` | Create a new folder |
| `ir_update_folder` | Rename a folder |
| `ir_delete_folder` | Delete a folder |

</details>

<details>
<summary><strong>Collections</strong> — 6 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_collections` | List all collections |
| `ir_get_collection` | Get a specific collection |
| `ir_get_collection_files` | List files in a collection |
| `ir_create_collection` | Create a collection with optional initial assets |
| `ir_update_collection` | Update name or add assets to a collection |
| `ir_delete_collection` | Delete a collection (files are preserved) |

</details>

<details>
<summary><strong>Keywords & Tagging</strong> — 9 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_keyword_sets` | List all keyword sets (tag groups) |
| `ir_get_keyword_set` | Get a specific keyword set |
| `ir_create_keyword_set` | Create a new keyword set |
| `ir_update_keyword_set` | Rename a keyword set |
| `ir_get_keywords` | List keywords in a set |
| `ir_get_keyword` | Get a specific keyword |
| `ir_create_keyword` | Create a keyword in a set |
| `ir_update_keyword` | Rename a keyword |
| `ir_delete_keyword` | Delete a keyword |

</details>

### Sharing & Distribution

<details>
<summary><strong>Quick Links</strong> — 5 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_quick_links` | List all download/share links |
| `ir_get_quick_link` | Get a specific quick link |
| `ir_get_user_quick_links` | List quick links for a specific user |
| `ir_create_quick_link` | Create a download link for a file |
| `ir_delete_quick_link` | Delete a quick link |

</details>

<details>
<summary><strong>Folder Links</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_folder_links` | List all folder sharing links |
| `ir_get_folder_link` | Get a specific folder link |
| `ir_create_folder_link` | Create a sharing link for a folder |
| `ir_delete_folder_link` | Delete a folder link |

</details>

<details>
<summary><strong>Upload Links</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_upload_links` | List all upload links |
| `ir_get_upload_link` | Get a specific upload link |
| `ir_create_upload_link` | Create an upload link for external contributors |
| `ir_delete_upload_link` | Delete an upload link |

</details>

### Product Information Management (PIM)

<details>
<summary><strong>Products</strong> — 8 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_products` | List products with filters (name, category, variants, template, dimension) |
| `ir_get_product` | Get a specific product |
| `ir_get_product_catalog` | Get the catalog a product belongs to |
| `ir_create_product` | Create a product with SKU, dimensions, and custom attributes |
| `ir_update_product` | Update product details |
| `ir_delete_product` | Delete a product |
| `ir_get_product_variants` | List all variants for a product |
| `ir_get_product_variant` | Get a specific variant |

</details>

<details>
<summary><strong>Variants</strong> — 3 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_create_variant` | Create a variant with dimension options and custom attributes |
| `ir_update_variant` | Update a variant |
| `ir_delete_variant` | Delete a variant |

</details>

<details>
<summary><strong>Catalogs</strong> — 6 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_catalogs` | List all product catalogs |
| `ir_get_catalog` | Get a specific catalog by ID |
| `ir_create_catalog` | Create a catalog with optional summary |
| `ir_update_catalog` | Rename a catalog |
| `ir_delete_catalog` | Delete a catalog |
| `ir_get_catalog_products` | List products in a catalog |

</details>

<details>
<summary><strong>Categories, Templates & Dimensions</strong> — 12 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_categories` | List product categories |
| `ir_get_category` | Get a specific category |
| `ir_get_templates` | List product templates |
| `ir_get_template` | Get a specific template |
| `ir_create_template` | Create a product template |
| `ir_update_template` | Update a template |
| `ir_get_channel_template_mappings` | Get channel template mappings |
| `ir_get_dimensions` | List product dimensions |
| `ir_get_dimension` | Get a specific dimension |
| `ir_create_dimension` | Create a dimension |
| `ir_update_dimension` | Update a dimension |
| `ir_add_dimension_option` | Add a value to a dimension |

</details>

<details>
<summary><strong>Custom Attributes</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_custom_attributes` | List all custom attributes |
| `ir_get_custom_attribute` | Get a specific custom attribute |
| `ir_create_custom_attribute` | Create a custom attribute |
| `ir_update_custom_attribute` | Update a custom attribute |

</details>

### Administration

<details>
<summary><strong>Users</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_me` | Get the authenticated user's profile |
| `ir_get_users` | List all users |
| `ir_get_user` | Get a specific user |
| `ir_search_users` | Search by name or email |

</details>

<details>
<summary><strong>Invited Users</strong> — 5 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_invited_users` | List pending invitations |
| `ir_get_invited_user` | Get a specific invitation |
| `ir_invite_user` | Invite a new user |
| `ir_delete_invited_user` | Cancel an invitation |
| `ir_create_sso_user` | Create a user via SSO |

</details>

<details>
<summary><strong>Permissions</strong> — 3 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_permissions` | List permission groups |
| `ir_get_permission` | Get a specific permission group |
| `ir_update_user_permission` | Change a user's permission group |

</details>

<details>
<summary><strong>Webhooks</strong> — 6 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_supported_webhooks` | List all supported event types |
| `ir_get_webhooks` | List configured webhooks |
| `ir_get_webhook` | Get a specific webhook |
| `ir_create_webhook` | Create a webhook |
| `ir_update_webhook` | Update a webhook's URL or notification emails |
| `ir_delete_webhook` | Delete a webhook |

</details>

## Features

- **Complete API coverage** — 101 tools covering every JSON endpoint in Image Relay's v2 API
- **Smart pagination** — Handles both response-body and Link-header pagination automatically
- **Retry with backoff** — Automatic retry on 429/502/503 with exponential backoff and Retry-After support
- **Dual output formats** — Every tool supports `markdown` (human-friendly) and `json` (machine-friendly) output
- **Detailed error messages** — Clear, actionable error descriptions for auth failures, rate limits, and more
- **MCP annotations** — Read-only, destructive, and idempotent hints for safe AI tool use

## Rate Limits

Image Relay allows **5 requests per second** per IP. The server handles rate limiting automatically:

- `429` responses trigger automatic retry with backoff
- `Retry-After` headers are respected when present
- Maximum 3 retries with up to 30 second delays

## Architecture

```
src/
├── index.ts                    Server entry point and tool registration
├── constants.ts                API base URLs and shared constants
├── op-fallback.ts              Optional 1Password credential resolution
├── schemas/
│   └── common.ts               Shared Zod schemas for pagination and formats
├── services/
│   ├── api-client.ts           Axios client, auth headers, pagination, retries
│   └── formatter.ts            Markdown and JSON response formatting
└── tools/
    ├── files.ts                Asset search, upload from URL, metadata updates
    ├── folders.ts              Folder navigation and organization
    ├── collections.ts          Collection CRUD and file assignment
    ├── products.ts             PIM products, variants, catalogs, dimensions
    ├── users.ts                User lookup and administration
    ├── permissions.ts          Permission groups and user access
    └── webhooks.ts             Webhook discovery and management
```

### Design Decisions

- **Single API client** keeps authentication, retry behavior, and pagination consistent across all 101 tools.
- **Tool modules mirror Image Relay domains** so DAM, sharing, PIM, administration, and webhook behavior stay easy to audit.
- **Markdown and JSON response modes** make the same tools useful for human review and downstream automation.
- **1Password fallback is optional** so public installs work with plain environment variables, while private setups can stay credential-free.

## Development

```bash
# Clone and install
git clone https://github.com/oliverames/imagerelay-mcp-server.git
cd imagerelay-mcp-server
npm install

# Run tests
npm test

# Dev mode (auto-restart on changes)
IMAGERELAY_API_KEY=your-key npm run dev

# Build
npm run build
```

## API Coverage

This server implements the full [Image Relay API v2](https://image-relay-api.readme.io/reference) with two intentional exceptions:

| Feature | Status | Notes |
|---------|--------|-------|
| Library API (files, folders, collections) | Complete | All endpoints |
| Sharing (quick links, folder links, upload links) | Complete | All endpoints |
| Keywording & metadata | Complete | All endpoints |
| Users, permissions, invitations | Complete | All endpoints |
| Webhooks | Complete | All endpoints |
| PIM (products, variants, catalogs, dimensions) | Complete | All endpoints |
| Custom attributes & templates | Complete | All endpoints |
| Chunked file uploads | Not included | Multi-step stateful workflow; use `ir_upload_file_from_url` instead |
| Update asset thumbnail | Not included | Requires binary upload (`application/octet-stream`) |

## License

MIT

<p align="center">
  <sub>Not affiliated with or endorsed by Image Relay.</sub>
</p>

---

<p align="center">
  <a href="https://www.buymeacoffee.com/oliverames">
    <img src="https://img.shields.io/badge/Buy_Me_a_Coffee-support-f5a542?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="Buy Me a Coffee">
  </a>
</p>

<p align="center">
  <sub>
    Built by <a href="https://ames.consulting">Oliver Ames</a> in Vermont
    &bull; <a href="https://github.com/oliverames">GitHub</a>
    &bull; <a href="https://linkedin.com/in/oliverames">LinkedIn</a>
    &bull; <a href="https://bsky.app/profile/oliverames.bsky.social">Bluesky</a>
  </sub>
</p>

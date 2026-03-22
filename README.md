<p align="center">
  <img src="https://www.imagerelay.com/hubfs/IR_Logo_Full_Color.svg" alt="Image Relay" width="320" />
</p>

<h1 align="center">Image Relay MCP Server</h1>

<p align="center">
  <strong>Complete Model Context Protocol server for Image Relay's digital asset management platform.</strong><br/>
  101 tools covering every JSON endpoint in the Image Relay API v2.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/imagerelay-mcp-server"><img src="https://img.shields.io/npm/v/imagerelay-mcp-server?color=%23C47432&label=npm" alt="npm version" /></a>
  <a href="https://image-relay-api.readme.io/reference"><img src="https://img.shields.io/badge/API-v2-blue" alt="API v2" /></a>
  <a href="#complete-tool-reference"><img src="https://img.shields.io/badge/tools-101-success" alt="101 tools" /></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-142-brightgreen" alt="142 tests" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP compatible" /></a>
</p>

---

## What is this?

This MCP server gives AI assistants like Claude **full access to your Image Relay DAM** through natural language. It covers both the **Library API** (files, folders, collections, metadata, sharing) and the **Products API** (PIM with products, variants, catalogs, dimensions, templates).

Built on the [Model Context Protocol](https://modelcontextprotocol.io), it works with Claude Desktop, Claude Code, and any MCP-compatible client.

## Quick Start

### 1. Get an API Key

In Image Relay, go to **My Account > API Keys** and generate a new key.

### 2. Configure your client

**Claude Desktop** — add to `claude_desktop_config.json`:

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

**Claude Code** — add to `.mcp.json` in your project or `~/.claude/settings.json` globally:

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

**Library workflows:**

> "Show me all subfolders in the Marketing Assets folder"
>
> "Upload this logo from URL and tag it with the Brand keyword set"
>
> "Find all files uploaded after January 2024 in Product Images, recursively"
>
> "Create a collection called Q2 Campaign and add assets 501, 502, 503"

**Sharing & distribution:**

> "Create a quick link for file 500 as a 800x600 JPG at 72 DPI"
>
> "Set up a folder link for the Press Kit folder that expires Dec 31"
>
> "Create an upload link so our agency can submit files to the Campaign folder"

**Product information management:**

> "List all products in the Fall 2024 catalog"
>
> "Create a product called Widget Pro with SKU WGT-001 in the Electronics category"
>
> "Add a Large Red variant to product 600 with the Size and Color dimensions"

**Administration:**

> "Who are the invited users that haven't accepted yet?"
>
> "Set up a webhook to POST to our Slack endpoint when files are created"
>
> "Search for users with @agency.com email addresses"

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `IMAGERELAY_API_KEY` | Yes | Your Image Relay API key (Bearer token) |
| `IMAGERELAY_SUBDOMAIN` | No | Your company subdomain (e.g. `acme` for `acme.imagerelay.com`). Defaults to `api.imagerelay.com` |

## How It Works

Every tool supports two output formats via the `response_format` parameter:

- **`markdown`** (default) — Human-friendly formatted output with headers, bullet points, and pagination hints
- **`json`** — Raw API response for programmatic use or when you need full field access

Paginated endpoints accept a `page` parameter (starting at 1). The server automatically handles both of Image Relay's pagination techniques (response-body objects and Link headers).

## Complete Tool Reference

### Library Management

<details>
<summary><strong>Files</strong> — 15 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_files` | List files in a folder with filters (date, type, search, recursive) |
| `ir_get_file` | Get full details for a specific file |
| `ir_upload_file_from_url` | Upload a file by providing a source URL, metadata terms, and keywords |
| `ir_update_file_metadata` | Update metadata terms on a file (append or overwrite) |
| `ir_update_file_tags` | Add or remove keyword tags on a file |
| `ir_move_file` | Move a file to one or more folders |
| `ir_duplicate_file` | Copy a file to another folder with optional metadata |
| `ir_create_synced_file` | Create synced copies across multiple folders (changes propagate) |
| `ir_delete_file` | Delete a file |
| `ir_get_file_types` | List all file types (metadata templates) |
| `ir_get_file_type` | Get a specific metadata template and its term definitions |
| `ir_create_upload_job` | Create a chunked upload job for large files |
| `ir_check_upload_job_status` | Check whether a chunked upload job has finished processing |
| `ir_create_file_version` | Start a version update — returns a UUID for chunk uploads |
| `ir_complete_file_version` | Signal that all version chunks are uploaded and ready to process |

</details>

<details>
<summary><strong>Folders</strong> — 7 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_root_folder` | Get the root folder (starting point for navigation) |
| `ir_get_folders` | List all folders with pagination |
| `ir_get_folder` | Get details for a specific folder |
| `ir_get_child_folders` | List immediate children of a folder |
| `ir_create_folder` | Create a new folder under a parent |
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
| `ir_create_collection` | Create a collection with optional initial asset IDs |
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

Quick links generate download/share URLs for individual files. The create tool supports image transformation options for on-the-fly resizing, format conversion, and DPI adjustment.

| Tool | Description |
|------|-------------|
| `ir_get_quick_links` | List all download/share links |
| `ir_get_quick_link` | Get a specific quick link |
| `ir_get_user_quick_links` | List quick links belonging to a specific user |
| `ir_create_quick_link` | Create a download link with optional transforms (`max_width`, `max_height`, `format`, `dpi`, `disposition`, `color_format`, `expires`) |
| `ir_delete_quick_link` | Delete a quick link |

</details>

<details>
<summary><strong>Folder Links</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_folder_links` | List all folder sharing links |
| `ir_get_folder_link` | Get a specific folder link |
| `ir_create_folder_link` | Create a sharing link (with download permission, expiry, tracking, purpose) |
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
| `ir_create_product` | Create a product with SKU, dimensions, dimension IDs, and custom attributes |
| `ir_update_product` | Update product name, SKU, dimensions, category, template, and custom attributes |
| `ir_delete_product` | Delete a product |
| `ir_get_product_variants` | List all variants for a product |
| `ir_get_product_variant` | Get a specific variant |

</details>

<details>
<summary><strong>Variants</strong> — 3 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_create_variant` | Create a variant with dimension options and custom attributes |
| `ir_update_variant` | Update variant name, dimension options, or custom attributes |
| `ir_delete_variant` | Delete a variant |

</details>

<details>
<summary><strong>Catalogs</strong> — 6 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_catalogs` | List all product catalogs |
| `ir_get_catalog` | Get a specific catalog |
| `ir_get_catalog_products` | List products in a catalog |
| `ir_create_catalog` | Create a catalog with optional summary |
| `ir_update_catalog` | Update a catalog's name and/or summary |
| `ir_delete_catalog` | Delete a catalog |

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
| `ir_update_template` | Rename a template |
| `ir_get_channel_template_mappings` | Get channel template mappings |
| `ir_get_dimensions` | List product dimensions |
| `ir_get_dimension` | Get a specific dimension |
| `ir_create_dimension` | Create a dimension |
| `ir_update_dimension` | Rename a dimension |
| `ir_add_dimension_option` | Add an option value to a dimension |

</details>

<details>
<summary><strong>Custom Attributes</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_custom_attributes` | List all product custom attributes |
| `ir_get_custom_attribute` | Get a specific custom attribute |
| `ir_create_custom_attribute` | Create a custom attribute |
| `ir_update_custom_attribute` | Rename a custom attribute |

</details>

### Administration

<details>
<summary><strong>Users</strong> — 4 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_me` | Get the authenticated user's profile |
| `ir_get_users` | List all users with pagination |
| `ir_get_user` | Get a specific user by ID |
| `ir_search_users` | Search by first name, last name, or email |

</details>

<details>
<summary><strong>Invited Users & SSO</strong> — 5 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_invited_users` | List pending invitations |
| `ir_get_invited_user` | Get a specific invitation |
| `ir_invite_user` | Invite a new user (with permission group and optional custom fields) |
| `ir_delete_invited_user` | Cancel a pending invitation |
| `ir_create_sso_user` | Create a user via Single Sign-On |

</details>

<details>
<summary><strong>Permissions</strong> — 3 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_permissions` | List all permission groups |
| `ir_get_permission` | Get a specific permission group |
| `ir_update_user_permission` | Change a user's permission group |

</details>

<details>
<summary><strong>Webhooks</strong> — 6 tools</summary>

| Tool | Description |
|------|-------------|
| `ir_get_supported_webhooks` | List all supported resource/action event types |
| `ir_get_webhooks` | List configured webhooks |
| `ir_get_webhook` | Get a specific webhook |
| `ir_create_webhook` | Create a webhook (resource, action, URL, notification emails) |
| `ir_update_webhook` | Update a webhook's delivery URL or notification emails |
| `ir_delete_webhook` | Delete a webhook |

</details>

## Features

- **Complete API coverage** — 101 tools covering every JSON endpoint in the v2 API
- **Smart pagination** — Automatically handles both response-body pagination objects and Link-header pagination
- **Retry with backoff** — 429/502/503 responses trigger automatic retry with exponential backoff; `Retry-After` headers are respected
- **Dual output formats** — Every tool supports `markdown` (human-readable) and `json` (raw API data)
- **Image transforms** — Quick links support on-the-fly resize, format conversion, DPI, and color space options
- **Actionable errors** — Auth failures, rate limits, timeouts, and DNS errors produce clear, specific messages
- **MCP annotations** — Every tool declares `readOnlyHint`, `destructiveHint`, and `idempotentHint` for safe AI tool use

## Rate Limits

Image Relay allows **5 requests per second** per IP. The server handles this automatically:

- `429` responses trigger retry with backoff
- `Retry-After` headers are respected when present
- Up to 3 retries with exponential backoff (max 30s delay)

## API Coverage

Every JSON endpoint in the [Image Relay API v2](https://image-relay-api.readme.io/reference) is implemented. The only three endpoints not included require binary (`application/octet-stream`) request bodies, which the MCP protocol cannot transport:

| Endpoint | Why excluded |
|----------|-------------|
| `POST /upload_jobs/{id}/files/{id}/chunks/{n}` | Binary file chunk data |
| `POST /files/{id}/versions/{uuid}/chunk/{n}` | Binary version chunk data |
| `POST /files/{id}/thumbnail` | Binary image data |

For chunked uploads, the server provides the **job management** tools (`ir_create_upload_job`, `ir_check_upload_job_status`) and **version management** tools (`ir_create_file_version`, `ir_complete_file_version`). The binary chunk transfer step is the only part that requires an external HTTP client.

For simpler uploads, use `ir_upload_file_from_url` — no chunking needed.

## Development

```bash
git clone https://github.com/oliverames/imagerelay-mcp-server.git
cd imagerelay-mcp-server
npm install

npm test          # Run 142 tests
npm run dev       # Dev mode with auto-restart
npm run build     # Compile TypeScript
```

## License

MIT

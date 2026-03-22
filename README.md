<p align="center">
  <img src="https://www.imagerelay.com/hubfs/IR_Logo_Full_Color.svg" alt="Image Relay" width="320" />
</p>

<h1 align="center">Image Relay MCP Server</h1>

<p align="center">
  <strong>MCP server for Image Relay's digital asset management platform.</strong><br/>
  101 tools. Full API v2 coverage.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/imagerelay-mcp-server"><img src="https://img.shields.io/npm/v/imagerelay-mcp-server?color=%23C47432&label=npm" alt="npm version" /></a>
  <a href="https://image-relay-api.readme.io/reference"><img src="https://img.shields.io/badge/API-v2-blue" alt="API v2" /></a>
  <a href="#tools"><img src="https://img.shields.io/badge/tools-101-success" alt="101 tools" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple" alt="MCP compatible" /></a>
</p>

---

## Setup

**1.** Get an API key in Image Relay: **My Account > API Keys**

**2.** Add to your MCP client config:

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

Set `IMAGERELAY_SUBDOMAIN` if you use `yourcompany.imagerelay.com` instead of `api.imagerelay.com`.

## Examples

> "Show me all subfolders in the Marketing Assets folder"
>
> "Upload this logo from URL and tag it with the Brand keyword set"
>
> "Create a quick link for file 500 as a 800x600 JPG at 72 DPI"
>
> "List all products in the Fall 2024 catalog"
>
> "Set up a webhook to POST to our Slack endpoint when files are created"

## Tools

Every tool supports `response_format`: `"markdown"` (default, human-readable) or `"json"` (raw API data). Paginated tools accept a `page` parameter.

### Files — 15 tools

| Tool | Description |
|------|-------------|
| `ir_get_files` | List files in a folder (filters: date, type, search, recursive) |
| `ir_get_file` | Get file details |
| `ir_upload_file_from_url` | Upload a file from a URL with metadata and keywords |
| `ir_update_file_metadata` | Update metadata terms (append or overwrite) |
| `ir_update_file_tags` | Add or remove keyword tags |
| `ir_move_file` | Move a file to one or more folders |
| `ir_duplicate_file` | Copy a file to another folder |
| `ir_create_synced_file` | Create synced copies across folders (changes propagate) |
| `ir_delete_file` | Delete a file |
| `ir_get_file_types` | List metadata templates |
| `ir_get_file_type` | Get a metadata template |
| `ir_create_upload_job` | Create a chunked upload job |
| `ir_check_upload_job_status` | Check upload job status |
| `ir_create_file_version` | Start a version update (returns UUID for chunks) |
| `ir_complete_file_version` | Complete a version upload |

### Folders — 7 tools

| Tool | Description |
|------|-------------|
| `ir_get_root_folder` | Get the root folder |
| `ir_get_folders` | List all folders |
| `ir_get_folder` | Get folder details |
| `ir_get_child_folders` | List children of a folder |
| `ir_create_folder` | Create a folder |
| `ir_update_folder` | Rename a folder |
| `ir_delete_folder` | Delete a folder |

### Collections — 6 tools

| Tool | Description |
|------|-------------|
| `ir_get_collections` | List collections |
| `ir_get_collection` | Get a collection |
| `ir_get_collection_files` | List files in a collection |
| `ir_create_collection` | Create a collection |
| `ir_update_collection` | Update name or add assets |
| `ir_delete_collection` | Delete a collection |

### Keywords — 9 tools

| Tool | Description |
|------|-------------|
| `ir_get_keyword_sets` | List keyword sets |
| `ir_get_keyword_set` | Get a keyword set |
| `ir_create_keyword_set` | Create a keyword set |
| `ir_update_keyword_set` | Rename a keyword set |
| `ir_get_keywords` | List keywords in a set |
| `ir_get_keyword` | Get a keyword |
| `ir_create_keyword` | Create a keyword |
| `ir_update_keyword` | Rename a keyword |
| `ir_delete_keyword` | Delete a keyword |

### Quick Links — 5 tools

| Tool | Description |
|------|-------------|
| `ir_get_quick_links` | List quick links |
| `ir_get_quick_link` | Get a quick link |
| `ir_get_user_quick_links` | List a user's quick links |
| `ir_create_quick_link` | Create a download link (options: `max_width`, `max_height`, `format`, `dpi`, `disposition`, `color_format`, `expires`) |
| `ir_delete_quick_link` | Delete a quick link |

### Folder Links — 4 tools

| Tool | Description |
|------|-------------|
| `ir_get_folder_links` | List folder links |
| `ir_get_folder_link` | Get a folder link |
| `ir_create_folder_link` | Create a folder sharing link |
| `ir_delete_folder_link` | Delete a folder link |

### Upload Links — 4 tools

| Tool | Description |
|------|-------------|
| `ir_get_upload_links` | List upload links |
| `ir_get_upload_link` | Get an upload link |
| `ir_create_upload_link` | Create an upload link |
| `ir_delete_upload_link` | Delete an upload link |

### Products — 8 tools

| Tool | Description |
|------|-------------|
| `ir_get_products` | List products (filters: name, category, variants, template, dimension) |
| `ir_get_product` | Get a product |
| `ir_get_product_catalog` | Get a product's catalog |
| `ir_create_product` | Create a product |
| `ir_update_product` | Update a product |
| `ir_delete_product` | Delete a product |
| `ir_get_product_variants` | List variants for a product |
| `ir_get_product_variant` | Get a variant |

### Variants — 3 tools

| Tool | Description |
|------|-------------|
| `ir_create_variant` | Create a variant |
| `ir_update_variant` | Update a variant |
| `ir_delete_variant` | Delete a variant |

### Catalogs — 6 tools

| Tool | Description |
|------|-------------|
| `ir_get_catalogs` | List catalogs |
| `ir_get_catalog` | Get a catalog |
| `ir_get_catalog_products` | List products in a catalog |
| `ir_create_catalog` | Create a catalog |
| `ir_update_catalog` | Update a catalog |
| `ir_delete_catalog` | Delete a catalog |

### Categories, Templates & Dimensions — 12 tools

| Tool | Description |
|------|-------------|
| `ir_get_categories` | List categories |
| `ir_get_category` | Get a category |
| `ir_get_templates` | List templates |
| `ir_get_template` | Get a template |
| `ir_create_template` | Create a template |
| `ir_update_template` | Update a template |
| `ir_get_channel_template_mappings` | Get channel template mappings |
| `ir_get_dimensions` | List dimensions |
| `ir_get_dimension` | Get a dimension |
| `ir_create_dimension` | Create a dimension |
| `ir_update_dimension` | Update a dimension |
| `ir_add_dimension_option` | Add an option to a dimension |

### Custom Attributes — 4 tools

| Tool | Description |
|------|-------------|
| `ir_get_custom_attributes` | List custom attributes |
| `ir_get_custom_attribute` | Get a custom attribute |
| `ir_create_custom_attribute` | Create a custom attribute |
| `ir_update_custom_attribute` | Update a custom attribute |

### Users — 4 tools

| Tool | Description |
|------|-------------|
| `ir_get_me` | Get authenticated user |
| `ir_get_users` | List users |
| `ir_get_user` | Get a user |
| `ir_search_users` | Search by name or email |

### Invited Users — 5 tools

| Tool | Description |
|------|-------------|
| `ir_get_invited_users` | List pending invitations |
| `ir_get_invited_user` | Get an invitation |
| `ir_invite_user` | Invite a user |
| `ir_delete_invited_user` | Cancel an invitation |
| `ir_create_sso_user` | Create an SSO user |

### Permissions — 3 tools

| Tool | Description |
|------|-------------|
| `ir_get_permissions` | List permission groups |
| `ir_get_permission` | Get a permission group |
| `ir_update_user_permission` | Change a user's permission group |

### Webhooks — 6 tools

| Tool | Description |
|------|-------------|
| `ir_get_supported_webhooks` | List supported event types |
| `ir_get_webhooks` | List webhooks |
| `ir_get_webhook` | Get a webhook |
| `ir_create_webhook` | Create a webhook |
| `ir_update_webhook` | Update a webhook |
| `ir_delete_webhook` | Delete a webhook |

## API Coverage

Every JSON endpoint in the [Image Relay API v2](https://image-relay-api.readme.io/reference) is implemented. Three binary-upload endpoints are excluded because MCP is JSON-only:

- `POST /upload_jobs/.../chunks/{n}` — binary file chunks
- `POST /files/.../versions/.../chunk/{n}` — binary version chunks
- `POST /files/{id}/thumbnail` — binary image data

For file uploads, use `ir_upload_file_from_url` (no chunking needed). For chunked workflows, the server handles job/version management — only the binary chunk POST requires an external HTTP client.

## Development

```bash
git clone https://github.com/oliverames/imagerelay-mcp-server.git
cd imagerelay-mcp-server
npm install
npm test          # 142 tests
npm run build     # compile
npm run dev       # watch mode
```

## License

MIT

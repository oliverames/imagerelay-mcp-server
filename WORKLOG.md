# Worklog

## 2026-04-06 — 1Password CLI fallback for credential resolution

**What changed**: Added automatic 1Password CLI fallback to credential resolution at startup. When environment variables are not set, the server attempts to resolve them via `op read` from the Development vault before failing. Uses `execFileSync` (Node) or `exec.Command` (Go) for shell-safe execution with a 10s timeout. Silent no-op if 1Password CLI is unavailable. Updated README to document the integration with `op://` reference paths. Part of a broader session that also touched ynab-mcp-server, imagerelay-mcp-server, meta-mcp-server, sprout-mcp-server, and ames-unifi-mcp.

**Decisions made**: Used `execFileSync` instead of `execSync` to avoid shell injection surface (even though inputs are hardcoded string literals). Added the fallback as a separate `op-fallback.ts` module (TS servers) or inline helper (Go) rather than modifying the existing auth flow, keeping the env var path as primary (zero overhead) and 1Password as fallback only. Chose `op://Development/` vault paths matching existing 1Password item names where items exist; for servers without items yet (Meta, Sprout, UniFi), chose conventional names so items can be created later.

**Left off at**: Published and pushed. 1Password items still need to be created for Meta Access Token, Threads Access Token, Sprout API Token/OAuth Client, and UniFi Controller credentials. YNAB and ImageRelay items already exist. Also: 20 uncategorized YNAB transactions from this session's review were identified but not yet categorized.

**Open questions**: None.

---



## 2026-03-22 — Ralph Loop: 5 new tools, bug fixes, field-level API gaps closed

**What changed**: Ran 10-iteration Ralph Loop review of the entire MCP server. Added 5 new tools (ir_create_upload_job, ir_check_upload_job_status, ir_create_file_version, ir_complete_file_version, ir_get_catalog). Fixed .json suffix bug on upload/version endpoints. Added missing fields to existing tools: dimension IDs on ir_create_product, summary on ir_update_catalog, 7 image transform params on ir_create_quick_link, 4 custom fields on ir_invite_user. /simplify review caught a silent gap in upload job status formatting (finished:false branch) and an unnecessary intermediate variable. 96→101 tools, 131→142 tests. README updated to match.

**Decisions made**:
- Upload job and file version tools provide JSON management endpoints only — binary chunk transfer is excluded since MCP is JSON-only. This means the server handles job lifecycle but the actual chunk POST requires an external HTTP client.
- `dupicate` endpoint spelling is intentional — it matches the actual Image Relay API typo. Not a bug in our code.
- `terms: null` in upload_file_from_url is intentional per API docs ("terms can be null").
- Kept small reference list endpoints (catalogs, categories, templates, dimensions) as non-paginated apiRequest calls — these are typically <50 items.

**Left off at**: API coverage is complete for all JSON endpoints. Remaining items from prior sessions still apply:
- Exclude `*.test.*` from npm tarball
- Consider npm publish of v2.1.0 with the new tools
- The `finished: false` vs `finished: null` distinction in upload job status should be verified against the live API when possible

**Open questions**:
- Quick link `purpose` field: live docs say required, scraped docs were ambiguous. Changed to required — verify this doesn't break existing callers that omit it.

---

## 2026-03-21 — README, MCP connector sync, Fantastical integration

**What changed**: Created comprehensive GitHub README with marketing-forward design (centered logo, badge bar, 96-tool reference across 16 collapsible sections). Added Image Relay + META MCP servers to dotfiles config (manifest.json, productivity.json) and chat sync script (sync-connectors-to-chat) with logo PNGs. Installed Image Relay as DXT extension in Claude Chat. Added Fantastical MCP to Claude Code via the DXT binary already installed in Claude Chat. Updated credentials/apple README to reflect distribution.p12 now present. All 4 repos (imagerelay-mcp-server, dotfiles, scripts, credentials) committed and pushed.

**Decisions made**:
- Image Relay env var mapping: `IMAGERELAY_API_KEY` (process env) mapped from `IMAGE_RELAY_API_KEY` (settings.json key) — names differ because the settings key predated the server code.
- META excluded from Claude Chat install since no access tokens are configured yet — script will pick it up automatically when tokens are added.
- Fantastical added to Claude Code by pointing directly to the DXT binary at `~/Library/Application Support/Claude/Claude Extensions/ant.dir.gh.flexibits.fantastical-mcp/server/FantasticalMCP.app/Contents/MacOS/FantasticalMCP`.

**Left off at**: Everything is deployed and working. Remaining items:
- Exclude `*.test.*` files from npm tarball (they compile to dist/ and ship unnecessarily — add a `tsconfig.build.json` or tweak `files` in package.json)
- Add META access tokens to settings.json when ready, then re-run `osascript ~/Developer/scripts/sync-connectors-to-chat` to install
- Consider adding Image Relay `update-asset-thumbnail` if binary upload support is ever needed

**Open questions**:
- Fantastical DXT path is hardcoded to the Chat extension directory — if the extension updates, the binary path could change. May want a symlink or lookup.

---

## 2026-03-21 — Complete API coverage: 33 new endpoints, bug fixes, npm 2.0.0 publish

**What changed**: Expanded from ~57 to ~91 MCP tools covering the entire Image Relay API (except binary uploads and chunked file uploads which aren't MCP-compatible). Added 3 new tool modules (invited-users, permissions, custom-attributes) and significantly expanded products.ts with variants, dimensions, templates, and catalog CRUD. Fixed 5 endpoint bugs found by cross-referencing scraped docs against live API. Bumped to v2.0.0 and published to npm. Test suite grew from 104 to 131 tests.

**Decisions made**:
- Skipped chunked file uploads (multi-step stateful workflow doesn't fit single MCP tool calls) and update-asset-thumbnail (requires binary octet-stream upload, not JSON). These are the only two API features not covered.
- Used PATCH for variant updates per API docs — required adding PATCH to the api-client's allowed methods.
- SSO user creation uses `role_id` (string) rather than `permission_id` (int) — the API naming is inconsistent across endpoints.
- Bumped to 2.0.0 since adding 33 endpoints is a major expansion.

**Left off at**: Package is published and feature-complete. Next steps would be:
- Exclude test files from npm tarball (add `tsconfig.build.json` that excludes `*.test.ts`, or update the `files` field)
- Add a README with usage instructions and tool listing
- Consider adding the `update-asset-thumbnail` endpoint if binary upload support is needed (would require streaming the file through axios with different Content-Type)

**Open questions**:
- The API docs list some ID params as `string` type (folder_id in upload, keyword_ids) while our code sends numbers. Works fine with Rails APIs but could be tightened if the API ever enforces strict typing.

---

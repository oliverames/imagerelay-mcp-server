# Worklog

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

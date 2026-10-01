# Changelog

## 1.5.0

- Synced with deployed Jam MCP 1.23.2 at [619c85f885c3](https://github.com/jamdotdev/apiofjam/commit/619c85f885c3782f77a49ef0bc68c4d87222d097), verified through production server initialization and its 35-tool inventory.
- Added `searchJams` guidance and marked `listJams` deprecated. Added `submitFeedback` with exact-text approval, privacy limits, and at most one submission per session.
- Corrected event filter examples to arrays and documented cursor pagination, total counts, and network response-body limits.
- Documented video thumbnail links and CLI proof capture guidance.
- Added `.codex-plugin/plugin.json` with Jam listing metadata, reusing the existing MCP configuration, skills, and logo.
- Documented Codex installation from GitHub and a local checkout using the existing `jam-plugins` marketplace.

## 1.4.1

- Documented GitHub Copilot CLI install. Copilot CLI reads the `.claude-plugin/` manifest and marketplace, so `copilot plugin install jam@jam-plugins` works with no new files.
- Synced tool and CLI docs with the shipped Jam MCP server and Jam CLI: `search` matches video Jams only, `listJams` filters by origin, `updateJam` also renames and edits descriptions, token expiry uses fixed lengths, paginated CLI output includes `truncated` and `hint`, and the `jam-cli` skill covers `jam record start`/`stop` and `--cdp`.
- Made the README and the `jam-cli` skill agent-neutral. The skill no longer assumes Cursor when it installs the CLI's command reference.

## 1.4.0

- Added a Claude Code plugin manifest and marketplace in `.claude-plugin/`. The same repository now installs in Claude Code with `/plugin marketplace add jamdotdev/jam-plugin`, with the Jam MCP server and both skills.
- Added `gemini-extension.json`. The repository installs as a Gemini CLI extension with `gemini extensions install https://github.com/jamdotdev/jam-plugin`.

## 1.3.0

- Added the `jam-cli` skill: install the Jam CLI, authenticate with `JAM_TOKEN` in headless environments, triage a Jam with `jam get`, and record proof of a fix with `jam record run`. Covers Cursor Cloud Agents and CI, where the MCP server is not wired up.
- Documented `jam record` and `jam create jam` in the README.

## 1.2.2

- Bundled the plugin logo at `assets/logo.png` and referenced it by relative path, as the Cursor plugin reference asks. The marketplace resolves it from the repository at the reviewed commit instead of fetching an external URL.

## 1.2.1

- Rewrote the plugin description and README opening for the Cursor marketplace listing.
- Corrected the Cursor UI paths. MCP servers, rules, and skills are managed from **Customize**, not `Settings > Features > MCP`.
- Corrected where personal access tokens come from: **Settings → MCP** in Jam, not team settings.
- Applied Jam's product terminology. The entity is a workspace, not a team, and Recording Links is a feature name.
- Pointed the MCP documentation link at `jam.dev/docs/jam-mcp` instead of the `/mcp` redirect, and the Chrome extension link at its current Chrome Web Store URL.
- Documented that a Recording Link captures console and network logs only when it starts from a verified connected domain.

## 1.2.0

- Fixed the plugin logo: it pointed at `https://jam.dev/favicon.svg`, which returns 404. It now points at `https://cdn-jam-assets.jam.dev/cursor-plugin/logo.png`, served from the Jam asset CDN.
- Added `.cursor-plugin/marketplace.json` so the repository can be added as a plugin folder in Cursor.
- Documented the 9 tools the Jam MCP server gained since v1.7.0: `getVideoChapters`, `createFolder`, `updateFolder`, `editComment`, `addReaction`, `removeReaction`, `deleteJam`, `deleteComment`, `deleteFolder`. The README and the `jam-bug-analysis` rule now cover all 33 tools.
- Called out the destructive `delete*` tools in their own section of both the README and the rule, with an instruction to confirm with the user before calling them.
- Fixed the Personal Access Token instructions, which told readers to replace an `auth` block that `mcp.json` no longer contains.
- Removed the `rules`, `skills`, and `mcpServers` path fields from the manifest. They named the default directories, which Cursor already discovers on its own.

## 1.1.0

- Updated for Jam MCP server v1.7.0 — now documents all 24 tools.
- New investigation tool: `getFrames` (still frames from video Jams — overview grid or timestamp sampling). Wired into the `jam-bug-analysis` rule and the `/investigate-bug` skill as the first visual-evidence step for video Jams.
- New recording-link tools: `createRecordingLink`, `listRecordingLinks`, `getRecordingLink`, `updateRecordingLink`, `deleteRecordingLink`, `listRecordingLinkJams`, `listRecordingUrls`, `getRecordingUrlVerifyLink`.
- Simplified `mcp.json` to the standard Cursor shape (`{"url": ...}`); removed the non-spec `auth.scopes` block (OAuth scopes come from server discovery).
- README: added a Jam CLI section.

## 1.0.0

- Initial release of the Jam plugin for Cursor.
- Connects to the Jam MCP server at `https://mcp.jam.dev/mcp` via OAuth (Personal Access Token also supported).
- Exposes 15 MCP tools: `getDetails`, `getNetworkRequests`, `getConsoleLogs`, `getUserEvents`, `getScreenshots`, `analyzeVideo`, `getVideoTranscript`, `getMetadata`, `listJams`, `listFolders`, `listMembers`, `createComment`, `updateJam`, `search`, `fetch`.
- Adds the `jam-bug-analysis` rule (always-on guidance for how to use the tools).
- Adds the `/investigate-bug` skill for end-to-end structured bug investigation.

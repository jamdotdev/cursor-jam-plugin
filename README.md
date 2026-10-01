<p align="center">
  <a href="https://jam.dev">
    <img src="https://storage.googleapis.com/jam-assets/github-repo.png" alt="Jam">
  </a>
</p>

<h1 align="center">Jam plugin</h1>

<p align="center">
  Give your coding agent the full story of a bug, in one Jam.
</p>

<p align="center">
  <a href="https://jam.dev/docs/jam-mcp"><strong>Jam MCP docs</strong></a> ·
  <a href="https://jam.dev/docs/cli"><strong>Jam CLI docs</strong></a> ·
  <a href="https://jam.dev"><strong>jam.dev</strong></a>
</p>
<br/>

---

Paste a Jam link into your coding agent, and it reads the recording, console logs, network requests, and user events on its own. You skip typing out repro steps and copying stack traces.

The plugin works in Cursor, Claude Code, Codex, GitHub Copilot CLI, and Gemini CLI. In each one, it connects the Jam Model Context Protocol (MCP) server and adds two skills.

## Install the plugin

### Cursor

Open **Customize** in the Cursor sidebar, search for **Jam**, and click **Install**.

To test an unreleased version, link the repository into Cursor's local plugin folder:

```bash
ln -s /path/to/jam-plugin ~/.cursor/plugins/local/jam
```

Then run **Developer: Reload Window** from the command palette (`Cmd+Shift+P`).

### Claude Code

```shell
/plugin marketplace add jamdotdev/jam-plugin
/plugin install jam@jam-plugins
```

The skills load as `/jam:investigate-bug` and `/jam:jam-cli`. To test an unreleased version, start Claude Code with `claude --plugin-dir /path/to/jam-plugin`.

### Codex

```bash
codex plugin marketplace add jamdotdev/jam-plugin
codex plugin add jam@jam-plugins
```

Codex uses `.codex-plugin/plugin.json` and the existing `jam-plugins` marketplace. It loads the Jam MCP server and the shared `jam:investigate-bug` and `jam:jam-cli` skills. Complete the OAuth prompt to sign in to Jam.

To test an unreleased checkout, add its local marketplace instead:

```bash
codex plugin marketplace add /path/to/jam-plugin
codex plugin add jam@jam-plugins
```

Start a new Codex session after installation. Run `/mcp` to check the Jam connection, then ask Codex to investigate a Jam link.

### GitHub Copilot CLI

```bash
copilot plugin marketplace add jamdotdev/jam-plugin
copilot plugin install jam@jam-plugins
```

### Gemini CLI

```bash
gemini extensions install https://github.com/jamdotdev/jam-plugin
```

Run `/mcp auth Jam` once to sign in. To test an unreleased version, run `gemini extensions link /path/to/jam-plugin`.

## Sign in

### OAuth

The plugin connects to `https://mcp.jam.dev/mcp`. Your agent prompts you to sign in to Jam in a browser during installation or when you first use a Jam tool. There is nothing else to set up.

### Personal access token

Use a token when a browser sign-in isn't possible, such as in CI or a headless environment.

1. Create a token in [**Settings → MCP**](https://jam.dev/s/settings/mcp) under **Personal Access Tokens**. Copy it right away, because Jam stores only a hash.
2. Add a `headers` block to the Jam server entry in your agent's MCP config. In Cursor, the file is `mcp.json`:

```json
{
  "mcpServers": {
    "Jam": {
      "url": "https://mcp.jam.dev/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

Each token works in one workspace, belongs to your account, and expires after seven days, 30 days, 90 days, or one year. You pick the length when you create it. See [Personal access tokens](https://jam.dev/docs/personal-access-tokens) for details.

## Check that it works

1. Confirm **Jam** is in your agent's list of MCP servers. In Cursor, open **Customize**. In Claude Code, Codex, or Gemini CLI, run `/mcp`. In GitHub Copilot CLI, run `copilot mcp list`.
2. Paste a Jam link into the chat and ask the agent to analyze it. Complete the browser sign-in if prompted.
3. Run the `investigate-bug` skill on a Jam link, such as `https://jam.dev/c/<id>`.

## What's included

### Jam MCP server

The server at `https://mcp.jam.dev/mcp` has 35 tools.

**Investigate a Jam**

| Tool | What it does |
|------|-------------|
| `getDetails` | Returns the Jam overview, device info, and the server's investigation guide |
| `getNetworkRequests` | Lists HTTP requests. Filter by status, method, host, or content type |
| `getConsoleLogs` | Lists console output. Filter by log level |
| `getUserEvents` | Lists clicks, inputs, navigation, and scrolls in order |
| `getScreenshots` | Returns the images from a screenshot Jam |
| `getFrames` | Returns still frames from a video Jam, as a grid or at chosen timestamps |
| `analyzeVideo` | Describes what the user was trying to do in a video |
| `getVideoTranscript` | Returns the transcript of a video Jam recorded with the mic on |
| `getVideoChapters` | Returns titled video chapters with start and end times, plus thumbnail links when available |
| `getMetadata` | Returns custom metadata the page sent with `jam.metadata()` |
| `search` | Finds a video Jam from a link or pasted text. For screenshot and replay Jams, use `searchJams` |
| `fetch` | Same as `getDetails` |

Network filters (`statusCode`, `contentType`, `host`, and `method`) and the console `logLevel` filter take arrays. Values within a filter are ORed; separate filters are ANDed. Network, console, and user-event responses report `total` and `nextCursor`. Pass `nextCursor` as `after` to continue. Network response bodies default to failed requests (`bodies: "errors"`); `bodies: "all"` includes successful responses too. Bodies are truncated to 4KB and flagged per row.

**Find and organize Jams**

| Tool | What it does |
|------|-------------|
| `searchJams` | Searches workspace Jams by text and structured filters, with date bounds and cursor pagination |
| `listJams` | Deprecated. Uses the legacy search filters and pagination; use `searchJams` |
| `listFolders` | Lists the folders in your workspace |
| `createFolder` | Creates a folder |
| `updateFolder` | Renames a folder. The Jams inside stay where they are |
| `listMembers` | Finds members of your workspace |
| `createComment` | Adds a Markdown comment to a Jam |
| `editComment` | Edits a comment you wrote |
| `addReaction` | Adds a reaction to a comment |
| `removeReaction` | Removes a reaction you added |
| `updateJam` | Renames a Jam, edits its description, or moves it to another folder. Editing the title or description needs an Admin or Creator seat |

Call `searchJams` with `v: 1`. Use `text` for text search, `where` for ANDed `{ field, op, value }` filters, `window` for date bounds, and `page` for the limit and cursor. Use `textIn` to restrict text matches to `title`, `description`, `comment`, `integration`, or `transcript`. Return each result's `url` unchanged so search attribution is preserved.

**Feedback**

| Tool | What it does |
|------|-------------|
| `submitFeedback` | Sends feedback about Jam to the Jam team for triage |

The agent must show you the exact feedback text and get your approval before sending it. Send at most one report per session, under 200 words, with no secrets, customer data, source code, or stack traces. Do not report a mistake the agent corrected itself.

**Delete**

These tools delete data for good. Jam has no trash, so nobody in your workspace can bring it back. In Cursor, the bundled rule tells the agent to ask you before it calls one of them. The server also marks most other write tools as destructive, so your agent may ask before those too.

| Tool | What it does |
|------|-------------|
| `deleteJam` | Deletes a Jam |
| `deleteComment` | Deletes a comment you wrote, with its attachments |
| `deleteFolder` | Deletes a folder and every Jam in it |

**Recording Links**

A Recording Link is a reusable URL that lets anyone record a Jam into your workspace.

| Tool | What it does |
|------|-------------|
| `createRecordingLink` | Creates a Recording Link. You can set a folder and an expiration date |
| `listRecordingLinks` | Lists your workspace's Recording Links |
| `getRecordingLink` | Returns one Recording Link and how many Jams it collected |
| `updateRecordingLink` | Changes a Recording Link's name, folder, expiration date, or metadata |
| `deleteRecordingLink` | Turns off a Recording Link. Jams already recorded with it stay |
| `listRecordingLinkJams` | Lists the Jams recorded with a Recording Link |
| `listRecordingUrls` | Lists your workspace's connected domains |
| `getRecordingUrlVerifyLink` | Returns a link that someone opens to verify a connected domain |

A Recording Link captures console and network logs only when it starts on a verified connected domain. Pass a `recordingUrlId` when you create one, or its Jams have no logs.

### Skill: investigate bug

`skills/investigate-bug/SKILL.md`

Run `/investigate-bug <jam-link-or-id>` for a full investigation. The agent reads the Jam, follows the server's investigation guide, checks network requests, console logs, and user events, looks at the screenshots or video, and writes up the likely root cause.

### Skill: Jam CLI

`skills/jam-cli/SKILL.md`

Teaches the agent to install the Jam CLI, sign in with `JAM_TOKEN` in headless environments, and read a Jam with `jam get`. It also shows how to run `jam skills install --target <agent> --project`, which adds the CLI's full command reference to your repository.

### Rule: Jam bug analysis

`rules/jam-bug-analysis.mdc`

Cursor only, where it is always on. Other agents don't load rules. It tells the agent which tool to call first, how to filter noisy results, and how to match console errors to failed network requests and user events.

## Jam CLI

The [Jam CLI](https://jam.dev/docs/cli) reads the same data in a terminal. It accepts the same personal access tokens as the MCP server.

```bash
curl -fsSL https://native.jam.dev/install | bash
jam auth login                                 # or: export JAM_TOKEN=jam_pat_...
jam get console <jam-link-or-id> --level error --json
```

On your own machine, use the MCP server in your agent. Use the CLI where MCP isn't set up, such as cloud agents, CI, and shell scripts that pipe `--json` output into other tools.

### Record proof of a fix

`jam record` records a window or display while a command runs, uploads the video, and returns a Jam link. Ask the agent to record the fix it made:

```bash
jam record windows --json
jam record run --window-id <id> --title "Checkout completes after fix" -- bun run e2e/checkout.ts
```

To record a browser fix with its console logs and network requests, add `--cdp 9222` and start Chrome with `--remote-debugging-port=9222`. To record several steps instead of one command, run `jam record start`, do the steps, then run `jam record stop`.

Add the Jam link to the pull request. For a bug fix, ask for two Jams: one that shows the bug and one that shows the fix. To turn an existing video or a Playwright `trace.zip` into a Jam without recording, run `jam create jam`. Recording works on macOS and Linux (X11).

## Privacy and permissions

- The plugin connects only to `https://mcp.jam.dev/mcp`.
- The OAuth scopes are `mcp:read` and `mcp:write`. Write access covers comments, reactions, folders, `updateJam`, the Recording Link tools that make changes, and the three `delete*` tools.
- The server checks permissions for each workspace and each Jam. Workspace changes require `mcp:write`. `submitFeedback` uses `mcp:read`; the agent must get your approval of the exact text before sending feedback to the Jam team.
- Every request sees only the Jams your account can already see.
- `createFolder` and `createRecordingLink` can upgrade you from Viewer to Creator when your workspace allows it. That can change seat billing and sends an email to workspace Admins. `createRecordingLink` also sends a webhook event to your workspace's webhook subscribers.

## Support

- To report a bug or request a feature, [open an issue](https://github.com/jamdotdev/jam-plugin/issues).
- For anything else about Jam, email [support@jam.dev](mailto:support@jam.dev).

## Links

- [jam.dev](https://jam.dev)
- [Jam Chrome extension](https://chromewebstore.google.com/detail/jam/iohjgamcilhbgmhbnllfolmkmmekfmci)
- [Jam MCP docs](https://jam.dev/docs/jam-mcp)
- [Personal access tokens](https://jam.dev/docs/personal-access-tokens)

## License

MIT. See [LICENSE](./LICENSE).

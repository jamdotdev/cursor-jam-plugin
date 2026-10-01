---
name: jam-cli
description: Use the `jam` CLI when the Jam MCP server is not connected (Cloud Agents, CI, headless shells) or when you need shell-composable output. Reads a Jam's console, network, frames, and transcript with `jam get`, and records proof of a fix with `jam record run`. Install, auth with JAM_TOKEN, and the triage and proof loops.
---

# Jam CLI

The Jam MCP server and the `jam` CLI read the same data with the same personal access token. Prefer the MCP tools when they are connected. Reach for the CLI when they are not (cloud agents, CI, a container) or when you want `--json` output to pipe through `jq`.

## Install

```bash
command -v jam >/dev/null || curl -fsSL https://native.jam.dev/install | bash
export PATH="$HOME/.local/bin:$PATH"
jam --version
```

Windows: `powershell -c "irm https://native.jam.dev/install.ps1 | iex"`.

## Authenticate

Check first, then pick the path that fits the environment:

```bash
jam auth status --json
```

- **Headless (Cloud Agents, CI):** set `JAM_TOKEN` to a personal access token. The CLI reads it for the life of the process and never writes it to disk. Create tokens under Settings → MCP at https://jam.dev/s/settings/mcp. Ask the user to add it as a secret; never paste a token into a file or a commit.
- **A machine with a browser:** `jam auth login` opens OAuth.
- **A token on stdin:** `echo "$TOKEN" | jam auth login --token`.

Exit code 3 means not authenticated. Branch on exit codes, not on stderr text.

## Load the full command reference

The binary ships its own skills. Install them into this repo so the agent gets the complete `jam get`, `jam list`, `jam create`, and `jam record` surface:

```bash
jam skills install --target <agent> --project
```

`<agent>` is one of `claude`, `cursor`, `codex`, or `opencode`. Pick the one you are running in.

`jam agent-context` prints the machine-readable command surface if you need a flag the skill does not mention.

## Triage a Jam link

A Jam id is the UUID at the end of `https://jam.dev/c/<id>`.

```bash
jam get jam "$ID" --json                      # what kind of Jam, title, URL
jam get intents "$ID" --json                  # cached summary: what the user tried, what broke
jam get console "$ID" --level error --json    # JS errors first
jam get network "$ID" --status 5xx --json     # failing backend calls
jam get events "$ID" --json                   # clicks, inputs, navigation
jam get frames "$ID" --overview               # one labeled grid of the video
jam get transcript "$ID" --json               # what the reporter said
```

Paginated reads return `{ items, next_cursor, truncated, hint }`. `hint` appears only when `truncated` is true. Pass `--after <cursor>` for the next page. Stop when you have the cause; do not fetch everything by reflex.

Leave findings on the Jam:

```bash
jam create comment "$ID" "Root cause: ..." --at 4200
```

## Record proof of a fix

`jam record run` records a window or display until the wrapped command exits, uploads the video, and prints `{ id, url, durationMs, width, height, target }`. Use it to attach evidence to a PR.

```bash
jam record windows --json                     # pick a windowId; ids change on reopen
jam record run --window-id <id> --title "Checkout completes after fix" --json -- bun run e2e/checkout.ts
```

- Proving a browser fix: add `--cdp <endpoint>` (a debug port such as `9222` from Chrome started with `--remote-debugging-port=9222 --user-data-dir=<dir>`, a `ws://` DevTools URL, or `auto`). The Jam's Console and Network panels fill from every open tab. `jam record start` prints a `cdpProxy`; point your browser driver at it instead of Chrome and its clicks and typing are recorded too.
- Driving several steps instead of one command: `jam record start [target flags]`, do the steps, then `jam record stop` uploads the Jam. `jam record cancel` discards it.
- No `--window-id` records the primary display. Fine on a box you own (CI runner, container). On a person's machine record one window and launch your own app instance so nothing of theirs is captured.
- macOS needs Screen Recording permission for the terminal. Linux needs an X11 display plus `ffmpeg wmctrl x11-xserver-utils`. Windows is not supported. `jam doctor` reports readiness.
- For a bug fix, record two Jams: the bug, then the fix. Comment each Jam's URL on the other.
- Title is the claim being proven, not "proof".

Create a Jam from an existing video or Playwright trace instead of recording live:

```bash
jam create jam '{"kind":"video","videoPath":"./run.mp4","playwrightTracePath":"./trace.zip","title":"Checkout"}'
```

Trace console, network, and user events are attached to the timeline, with typed secrets redacted.

## Deletes

Every `jam delete ...` needs `--yes` when piped, and nothing deleted can be restored. Confirm with the user before passing `--yes`.

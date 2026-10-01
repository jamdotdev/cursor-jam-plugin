import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  throw new Error("Usage: bun scripts/sync-mcp-version.ts [--check]");
}
const token = process.env.JAM_TOKEN;
if (!token) throw new Error("Set JAM_TOKEN to a production Jam personal access token.");

const response = await fetch("https://mcp.jam.dev/mcp", {
  method: "POST",
  redirect: "error",
  signal: AbortSignal.timeout(20_000),
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "jam-plugin-version-sync",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "jam-plugin-version-sync", version: "1.0.0" },
    },
  }),
});
if (!response.ok) throw new Error(`Production MCP returned HTTP ${response.status}.`);
const body = await response.text();
const payload = response.headers.get("content-type")?.includes("text/event-stream")
  ? body.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n")
  : body;
const message = JSON.parse(payload);
const version = message.result?.serverInfo?.version;
if (message.result?.serverInfo?.name !== "Jam" || typeof version !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
  throw new Error("Production MCP did not return a stable Jam server version.");
}

const paths = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "gemini-extension.json",
];
const manifests = await Promise.all(paths.map(async (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  const text = await readFile(url, "utf8");
  const manifest = JSON.parse(text);
  if (manifest.name !== "jam" || typeof manifest.version !== "string") {
    throw new Error(`Invalid Jam manifest: ${path}`);
  }
  return { path, url, text, version: manifest.version };
}));
for (const manifest of manifests) {
  const local = manifest.version.split(".").map(Number);
  const remote = version.split(".").map(Number);
  const difference = local.findIndex((part, index) => part !== remote[index]);
  if (difference !== -1 && local[difference] > remote[difference]) {
    throw new Error(`${manifest.path} (${manifest.version}) is ahead of production ${version}; refusing to downgrade.`);
  }
}
const stale = manifests.filter((manifest) => manifest.version !== version);
if (args.includes("--check")) {
  if (stale.length) throw new Error(`Production is ${version}; update ${stale.map((m) => `${m.path} (${m.version})`).join(", ")}.`);
} else {
  for (const manifest of stale) {
    await writeFile(manifest.url, manifest.text.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`));
  }
}
console.log(`All four plugin manifests match production MCP ${version}.`);

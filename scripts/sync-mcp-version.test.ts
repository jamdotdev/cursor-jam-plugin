import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const paths = [".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json", "gemini-extension.json"];
for (const scenario of ["json", "sse", "http-error", "invalid-version", "downgrade"]) {
  test(scenario, () => {
    const root = mkdtempSync(join(tmpdir(), "jam-version-test-"));
    try {
      mkdirSync(join(root, "scripts"));
      writeFileSync(join(root, "scripts/sync-mcp-version.ts"), readFileSync(new URL("./sync-mcp-version.ts", import.meta.url)));
      for (const path of paths) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), JSON.stringify({ name: "jam", version: scenario === "downgrade" ? "1.24.0" : "1.5.0", description: "preserve me" }));
      }
      const original = paths.map((path) => readFileSync(join(root, path), "utf8"));
      const message = JSON.stringify({ result: { serverInfo: { name: "Jam", version: scenario === "invalid-version" ? "unknown" : "1.23.2" } } });
      const body = scenario === "sse" ? `event: message\r\ndata: ${message}\r\n\r\n` : message;
      writeFileSync(join(root, "mock.ts"), `globalThis.fetch = async () => new Response(${JSON.stringify(body)}, {status: ${scenario === "http-error" ? 401 : 200}, headers: {"content-type": "${scenario === "sse" ? "text/event-stream" : "application/json"}"}});`);
      const command = [process.execPath, "--preload", "./mock.ts", "scripts/sync-mcp-version.ts"];
      const options = { cwd: root, env: { ...process.env, JAM_TOKEN: "test-token" }, stdout: "pipe" as const, stderr: "pipe" as const };
      expect(Bun.spawnSync([...command, "--check"], options).exitCode).not.toBe(0);
      expect(paths.map((path) => readFileSync(join(root, path), "utf8"))).toEqual(original);
      const result = Bun.spawnSync(command, options);
      if (["http-error", "invalid-version", "downgrade"].includes(scenario)) {
        expect(result.exitCode).not.toBe(0);
        expect(paths.map((path) => readFileSync(join(root, path), "utf8"))).toEqual(original);
      } else {
        expect(result.exitCode).toBe(0);
        for (const path of paths) {
          expect(JSON.parse(readFileSync(join(root, path), "utf8"))).toEqual({ name: "jam", version: "1.23.2", description: "preserve me" });
        }
        expect(Bun.spawnSync([...command, "--check"], options).exitCode).toBe(0);
        const synced = paths.map((path) => readFileSync(join(root, path), "utf8"));
        expect(Bun.spawnSync(command, options).exitCode).toBe(0);
        expect(paths.map((path) => readFileSync(join(root, path), "utf8"))).toEqual(synced);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

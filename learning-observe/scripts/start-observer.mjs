#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, "..");
const webRoot = path.resolve(skillRoot, "..", "web");

function registryPath(workspace) {
  const key = createHash("sha256").update(workspace).digest("hex").slice(0, 16);
  return path.join(tmpdir(), `learning-observer-${key}.json`);
}

async function healthy(url) {
  try { return (await fetch(`${url}/api/view`, { signal: AbortSignal.timeout(600) })).ok; }
  catch { return false; }
}

async function availablePort(preferred) {
  for (let port = preferred; port < preferred + 40; port += 1) {
    const free = await new Promise((resolve) => {
      const probe = createServer();
      probe.once("error", () => resolve(false));
      probe.listen(port, host, () => probe.close(() => resolve(true)));
    });
    if (free) return port;
  }
  throw new Error(`no available port found near ${preferred}`);
}

export async function startObserver(workspaceInput, options = {}) {
  const workspace = path.resolve(workspaceInput || process.cwd());
  if (!existsSync(workspace) || !statSync(workspace).isDirectory()) throw new Error(`learning workspace not found: ${workspace}`);
  const serverEntry = path.join(webRoot, "server", "index.mjs");
  const webBuild = path.join(webRoot, "dist", "index.html");
  if (!existsSync(serverEntry) || !existsSync(webBuild)) throw new Error("Learning Observer runtime is missing. Run ./install.sh from the learning-skill repository, or build web/ with npm install && npm run build.");

  const registry = registryPath(workspace);
  if (existsSync(registry)) {
    try {
      const previous = JSON.parse(readFileSync(registry, "utf8"));
      if (previous.url && await healthy(previous.url)) return { ...previous, reused: true };
    } catch { /* stale runtime record */ }
  }

  const preferred = Number(options.port || process.env.LEARNING_WEB_PORT || 4174);
  const port = await availablePort(Number.isInteger(preferred) && preferred > 0 ? preferred : 4174);
  const url = `http://${host}:${port}`;
  const logPath = path.join(tmpdir(), `learning-observer-${port}.log`);
  const log = openSync(logPath, "a");
  const child = spawn(process.execPath, [serverEntry, workspace], { cwd: webRoot, detached: true, stdio: ["ignore", log, log], env: { ...process.env, LEARNING_WEB_HOST: host, LEARNING_WEB_PORT: String(port) } });
  child.unref();
  closeSync(log);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await healthy(url)) {
      const record = { url, pid: child.pid, workspace, logPath };
      writeFileSync(registry, JSON.stringify(record));
      return { ...record, reused: false };
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  try { process.kill(child.pid, "SIGTERM"); } catch { /* child already exited */ }
  throw new Error(`Learning Observer did not become ready. See ${logPath}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await startObserver(process.argv[2]);
    process.stdout.write(`${result.reused ? "reused" : "started"}: ${result.url}\n`);
  } catch (error) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exitCode = 1;
  }
}

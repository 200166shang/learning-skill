#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function fail(message) {
  console.error(message);
  process.exit(2);
}

function expandHome(value) {
  if (value === "~") return homedir();
  if (value.startsWith("~/")) return join(homedir(), value.slice(2));
  return value;
}

function parseArgs(argv) {
  const result = { workspace: null, goal: null, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--workspace") result.workspace = argv[++i] ?? null;
    else if (arg === "--goal") result.goal = argv[++i] ?? null;
    else if (arg === "--dry-run") result.dryRun = true;
    else fail(`Unknown argument: ${arg}`);
  }
  return result;
}

function isViewerDir(candidate) {
  return existsSync(join(candidate, "package.json")) && existsSync(join(candidate, "scripts", "launch.mjs"));
}

function resolveViewerDir() {
  if (process.env.LEARNING_VIEWER_DIR) {
    const override = resolve(expandHome(process.env.LEARNING_VIEWER_DIR));
    if (!isViewerDir(override)) fail(`Learning Companion not found at LEARNING_VIEWER_DIR: ${override}`);
    return override;
  }

  const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const candidates = [resolve(skillDir, "..", "_learning-viewer"), resolve(skillDir, "..", "viewer")];
  const found = candidates.find(isViewerDir);
  if (!found) fail("Learning Companion installation was not found beside the Learning Suite skills.");
  return found;
}

const args = parseArgs(process.argv.slice(2));
if (!args.workspace) fail("--workspace is required");

const workspace = resolve(expandHome(args.workspace));
if (!existsSync(workspace) || !statSync(workspace).isDirectory()) fail(`Learning workspace does not exist: ${workspace}`);

const viewerDir = resolveViewerDir();
const launchScript = join(viewerDir, "scripts", "launch.mjs");
const cliPackage = join(viewerDir, "node_modules", "@tauri-apps", "cli", "package.json");
const installNeeded = !existsSync(cliPackage);
const launchArgs = [launchScript, "--workspace", workspace, ...(args.goal ? ["--goal", args.goal] : [])];
const dryRun = args.dryRun || process.env.LEARNING_VIEW_DRY_RUN === "1";

if (dryRun) {
  console.log(JSON.stringify({
    viewer_dir: viewerDir,
    workspace,
    install_needed: installNeeded,
    install_command: installNeeded ? ["npm", "ci", "--prefix", viewerDir] : null,
    launch_command: [process.execPath, ...launchArgs],
    detached: true,
  }));
  process.exit(0);
}

if (installNeeded) {
  const install = spawnSync("npm", ["ci", "--prefix", viewerDir], { stdio: "inherit" });
  if (install.status !== 0) process.exit(install.status ?? 1);
}

const child = spawn(process.execPath, launchArgs, {
  cwd: viewerDir,
  detached: true,
  stdio: "ignore",
});
child.unref();
console.log(`Learning Companion launched for ${workspace}`);

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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
  return existsSync(join(candidate, "package.json"));
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

function readReady(readyFile, workspace, goal) {
  if (!existsSync(readyFile)) return null;
  try {
    const ready = JSON.parse(readFileSync(readyFile, "utf8"));
    if (ready.workspace !== workspace || (ready.goal ?? null) !== goal) return null;
    process.kill(ready.pid, 0);
    return ready;
  } catch {
    return null;
  }
}

function run(command) {
  const result = spawnSync(command[0], command.slice(1), { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function waitUntil(predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
  }
  return false;
}

const args = parseArgs(process.argv.slice(2));
if (!args.workspace) fail("--workspace is required");
const dryRun = args.dryRun || process.env.LEARNING_VIEW_DRY_RUN === "1";
if (process.platform !== "darwin" && !dryRun) fail("The packaged Learning Companion currently requires macOS.");

const workspace = resolve(expandHome(args.workspace));
if (!existsSync(workspace) || !statSync(workspace).isDirectory()) fail(`Learning workspace does not exist: ${workspace}`);

const viewerDir = resolveViewerDir();
const appPath = process.env.LEARNING_VIEWER_APP
  ? resolve(expandHome(process.env.LEARNING_VIEWER_APP))
  : join(viewerDir, "Learning Companion.app");
if (!existsSync(appPath)) fail(`The prebuilt Learning Companion app is missing at ${appPath}; run the Learning Suite installer.`);

const projectionScript = resolve(viewerDir, "..", "_shared", "scripts", "learning-view.mjs");
if (!existsSync(projectionScript)) fail(`Learning projection script is missing at ${projectionScript}`);

const stateDir = resolve(expandHome(process.env.LEARNING_VIEWER_STATE_DIR ?? join(tmpdir(), "learning-companion")));
mkdirSync(stateDir, { recursive: true });
const instanceKey = createHash("sha256").update(JSON.stringify([workspace, args.goal])).digest("hex").slice(0, 20);
const readyFile = join(stateDir, `${instanceKey}.json`);
const focusFile = `${readyFile}.focus`;
const ready = readReady(readyFile, workspace, args.goal);
const launchCommand = [
  "open", "-n", appPath, "--args",
  "--workspace", workspace,
  "--node-path", process.execPath,
  "--projection-script", projectionScript,
  "--ready-file", readyFile,
  "--focus-file", focusFile,
  ...(args.goal ? ["--goal", args.goal] : []),
];
const plan = {
  mode: ready ? "focus" : "launch",
  viewer_dir: viewerDir,
  app_path: appPath,
  workspace,
  ready_file: readyFile,
  focus_file: focusFile,
  launch_command: ready ? null : launchCommand,
};
if (dryRun) {
  console.log(JSON.stringify(plan));
  process.exit(0);
}

if (ready) {
  writeFileSync(focusFile, "focus\n");
  if (!waitUntil(() => !existsSync(focusFile), 2_000)) {
    fail("Learning Companion is running but did not acknowledge the focus request.");
  }
  console.log(`Learning Companion focused for ${workspace}`);
  process.exit(0);
}

rmSync(readyFile, { force: true });
run(launchCommand);
if (waitUntil(() => readReady(readyFile, workspace, args.goal), 15_000)) {
  console.log(`Learning Companion ready for ${workspace}`);
  process.exit(0);
}
fail("Learning Companion opened but did not render a learning projection within 15 seconds.");

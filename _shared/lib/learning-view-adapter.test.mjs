import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const script = path.join(repo, "learning-view", "scripts", "open-viewer.mjs");

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "learning-view-adapter-"));
  const viewer = path.join(root, "viewer");
  const workspace = path.join(root, "workspace");
  const app = path.join(viewer, "Learning Companion.app");
  const projection = path.join(root, "_shared", "scripts", "learning-view.mjs");
  const stateDir = path.join(root, "state");
  mkdirSync(path.join(app, "Contents", "MacOS"), { recursive: true });
  mkdirSync(path.dirname(projection), { recursive: true });
  mkdirSync(stateDir, { recursive: true });
  mkdirSync(workspace, { recursive: true });
  writeFileSync(path.join(viewer, "package.json"), "{}\n");
  writeFileSync(path.join(app, "Contents", "MacOS", "learning-companion"), "fixture\n");
  writeFileSync(projection, "// fixture\n");
  return { root, viewer, workspace, app, projection, stateDir };
}

test("viewer adapter launches the prebuilt app with explicit runtime paths", () => {
  const f = fixture();
  try {
    const output = execFileSync(process.execPath, [script, "--workspace", f.workspace, "--goal", "g001", "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer, LEARNING_VIEWER_STATE_DIR: f.stateDir },
    });
    const plan = JSON.parse(output);
    assert.equal(plan.viewer_dir, f.viewer);
    assert.equal(plan.workspace, f.workspace);
    assert.equal(plan.mode, "launch");
    assert.equal(plan.app_path, f.app);
    assert.deepEqual(plan.launch_command.slice(0, 4), ["open", "-n", f.app, "--args"]);
    assert.deepEqual(plan.launch_command.slice(4, 8), ["--workspace", f.workspace, "--node-path", process.execPath]);
    assert.ok(plan.launch_command.includes(f.projection));
    assert.ok(plan.launch_command.includes("--ready-file"));
    assert.ok(plan.launch_command.includes("--focus-file"));
    assert.deepEqual(plan.launch_command.slice(-2), ["--goal", "g001"]);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("viewer adapter reuses and focuses a ready instance for the same workspace", () => {
  const f = fixture();
  try {
    const env = { ...process.env, LEARNING_VIEWER_DIR: f.viewer, LEARNING_VIEWER_STATE_DIR: f.stateDir };
    const first = JSON.parse(execFileSync(process.execPath, [script, "--workspace", f.workspace, "--dry-run"], {
      encoding: "utf8",
      env,
    }));
    writeFileSync(first.ready_file, JSON.stringify({ pid: process.pid, workspace: f.workspace, goal: null }));
    const second = JSON.parse(execFileSync(process.execPath, [script, "--workspace", f.workspace, "--dry-run"], {
      encoding: "utf8",
      env,
    }));
    assert.equal(second.mode, "focus");
    assert.equal(second.launch_command, null);
    assert.equal(second.focus_file, `${first.ready_file}.focus`);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("viewer adapter fails closed when workspace is missing", () => {
  const f = fixture();
  try {
    const result = spawnSync(process.execPath, [script, "--workspace", path.join(f.root, "missing"), "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer, LEARNING_VIEWER_STATE_DIR: f.stateDir },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /workspace does not exist/i);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("viewer adapter fails closed when the prebuilt app is missing", () => {
  const f = fixture();
  try {
    rmSync(f.app, { recursive: true, force: true });
    const result = spawnSync(process.execPath, [script, "--workspace", f.workspace, "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer, LEARNING_VIEWER_STATE_DIR: f.stateDir },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /prebuilt Learning Companion app/i);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

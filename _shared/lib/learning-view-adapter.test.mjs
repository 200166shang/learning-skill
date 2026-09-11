import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const script = path.join(repo, "learning-view", "scripts", "open-viewer.mjs");

function fixture({ installed = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "learning-view-adapter-"));
  const viewer = path.join(root, "viewer");
  const workspace = path.join(root, "workspace");
  mkdirSync(path.join(viewer, "scripts"), { recursive: true });
  mkdirSync(workspace, { recursive: true });
  writeFileSync(path.join(viewer, "package.json"), "{}\n");
  writeFileSync(path.join(viewer, "scripts", "launch.mjs"), "// fixture\n");
  if (installed) {
    mkdirSync(path.join(viewer, "node_modules", "@tauri-apps", "cli"), { recursive: true });
    writeFileSync(path.join(viewer, "node_modules", "@tauri-apps", "cli", "package.json"), "{}\n");
  }
  return { root, viewer, workspace };
}

test("viewer adapter resolves installed layout and emits a detached dry-run launch", () => {
  const f = fixture();
  try {
    const output = execFileSync(process.execPath, [script, "--workspace", f.workspace, "--goal", "g001", "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer },
    });
    const plan = JSON.parse(output);
    assert.equal(plan.viewer_dir, f.viewer);
    assert.equal(plan.workspace, f.workspace);
    assert.equal(plan.install_needed, false);
    assert.equal(plan.install_command, null);
    assert.equal(plan.detached, true);
    assert.deepEqual(plan.launch_command.slice(-4), ["--workspace", f.workspace, "--goal", "g001"]);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("viewer adapter reports dependency installation only when needed", () => {
  const f = fixture({ installed: false });
  try {
    const output = execFileSync(process.execPath, [script, "--workspace", f.workspace, "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer },
    });
    const plan = JSON.parse(output);
    assert.equal(plan.install_needed, true);
    assert.deepEqual(plan.install_command, ["npm", "ci", "--prefix", f.viewer]);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("viewer adapter fails closed when workspace is missing", () => {
  const f = fixture();
  try {
    const result = spawnSync(process.execPath, [script, "--workspace", path.join(f.root, "missing"), "--dry-run"], {
      encoding: "utf8",
      env: { ...process.env, LEARNING_VIEWER_DIR: f.viewer },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /workspace does not exist/i);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

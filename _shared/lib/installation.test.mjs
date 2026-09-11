import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const cli = fileURLToPath(new URL("../../scripts/learning-installation.mjs", import.meta.url));
const temp = () => mkdtempSync(path.join(tmpdir(), "learning-install-"));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

test("runtime-only install skips viewer, records revision and verifies content", () => {
  const target = path.join(temp(), "skills"), result = run("install", "--target", target, "--runtime-only", "--skip-dependencies");
  assert.equal(result.status, 0, result.stderr); assert.ok(existsSync(path.join(target, "learning-learn", "SKILL.md"))); assert.ok(!existsSync(path.join(target, "_learning-viewer")));
  const manifest = JSON.parse(readFileSync(path.join(target, "learning-installation-manifest.json"))); assert.match(manifest.sourceRevision, /^(?:[0-9a-f]{40}|unknown)$/); assert.ok(manifest.files["learning-learn/SKILL.md"]);
  assert.equal(typeof manifest.sourceDirty, "boolean");
  assert.equal(run("verify", "--target", target).status, 0); writeFileSync(path.join(target, "learning-learn", "SKILL.md"), "changed\n");
  const changed = run("verify", "--target", target); assert.equal(changed.status, 1); assert.match(changed.stdout, /changed: learning-learn\/SKILL\.md/);
});

test("help returns before target or build side effects", () => {
  const root = temp(), target = path.join(root, "must-not-exist"), result = run("install", "--target", target, "--help");
  assert.equal(result.status, 0); assert.match(result.stdout, /runtime-only/); assert.equal(existsSync(target), false);
});
test("verification rejects malformed and escaping manifests before file access", () => {
  const target = temp(); writeFileSync(path.join(target, "learning-installation-manifest.json"), JSON.stringify({})); assert.equal(run("verify", "--target", target).status, 1);
  writeFileSync(path.join(target, "learning-installation-manifest.json"), JSON.stringify({ manifestVersion: 1, sourceRevision: "unknown", sourceDirty: false, mode: "runtime-only", directories: ["_shared"], files: { "../outside": "0".repeat(64) } })); const result = run("verify", "--target", target); assert.equal(result.status, 1); assert.match(result.stdout, /invalid manifest file entry/);
});

test("internal symlinks verify and escaped directory symlinks fail closed", async () => {
  const root = temp(), bundle = path.join(root, "bundle"), outside = temp(); mkdirSync(bundle); writeFileSync(path.join(bundle, "real"), "content"); symlinkSync("real", path.join(bundle, "link"));
  const { buildContentManifest } = await import("./installation.mjs"); writeFileSync(path.join(root, "learning-installation-manifest.json"), JSON.stringify(buildContentManifest(root, ["bundle"], "unknown", "full")));
  assert.equal(run("verify", "--target", root).status, 0); writeFileSync(path.join(bundle, "real"), "tampered"); assert.equal(run("verify", "--target", root).status, 1);
  const escaped = temp(); symlinkSync(outside, path.join(escaped, "bundle")); writeFileSync(path.join(outside, "file"), "x"); writeFileSync(path.join(escaped, "learning-installation-manifest.json"), JSON.stringify({ manifestVersion: 1, sourceRevision: "unknown", sourceDirty: false, mode: "full", directories: ["bundle"], files: { "bundle/file": "0".repeat(64) } })); assert.match(run("verify", "--target", escaped).stdout, /directory escapes/);
});
test("staging copy preserves relative bundle symlinks", async () => {
  const source = temp(), destination = path.join(temp(), "bundle"); writeFileSync(path.join(source, "real"), "content"); symlinkSync("real", path.join(source, "link"));
  const { copyInstallationTree } = await import("./installation.mjs"); copyInstallationTree(source, destination); assert.equal(readlinkSync(path.join(destination, "link")), "real");
});

test("runtime-only preserves viewer and a failed swap restores prior installation", () => {
  const target = path.join(temp(), "skills"); mkdirSync(path.join(target, "_learning-viewer"), { recursive: true }); writeFileSync(path.join(target, "_learning-viewer", "sentinel"), "viewer"); mkdirSync(path.join(target, "learning-learn")); writeFileSync(path.join(target, "learning-learn", "sentinel"), "prior");
  assert.equal(run("install", "--target", target, "--runtime-only", "--skip-dependencies").status, 0); assert.equal(readFileSync(path.join(target, "_learning-viewer", "sentinel"), "utf8"), "viewer");
  writeFileSync(path.join(target, "learning-learn", "sentinel"), "prior-again"); const failed = spawnSync(process.execPath, [cli, "install", "--target", target, "--runtime-only", "--skip-dependencies"], { encoding: "utf8", env: { ...process.env, LEARNING_INSTALL_TEST_FAILURE: "after-backup" } }); assert.equal(failed.status, 1); assert.equal(readFileSync(path.join(target, "learning-learn", "sentinel"), "utf8"), "prior-again"); assert.equal(readFileSync(path.join(target, "_learning-viewer", "sentinel"), "utf8"), "viewer");
});

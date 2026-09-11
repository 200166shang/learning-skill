import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("development server matches Tauri devUrl and app arguments pass through Cargo to the app", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const config = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"));
  const launch = readFileSync(new URL("../scripts/launch.mjs", import.meta.url), "utf8");

  assert.match(pkg.scripts.dev, /vite --port 1420 --strictPort/);
  assert.equal(config.build.devUrl, "http://localhost:1420");
  assert.match(launch, /\["exec", "tauri", "--", "dev", "--", "--", \.\.\.process\.argv\.slice\(2\)\]/);
});

test("production install builds a macOS app and runtime readiness is projection-backed", () => {
  const config = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"));
  const rust = readFileSync(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8");
  const install = readFileSync(new URL("../../install.sh", import.meta.url), "utf8");

  assert.equal(config.bundle.active, true);
  assert.deepEqual(config.bundle.targets, ["app"]);
  assert.match(rust, /argument\("--node-path"\)/);
  assert.match(rust, /argument\("--projection-script"\)/);
  assert.match(rust, /argument\("--ready-file"\)/);
  assert.match(rust, /argument\("--focus-file"\)/);
  assert.match(rust, /std::process::id\(\)/);
  assert.match(rust, /window\s*\.set_focus\(\)/);
  assert.match(install, /tauri[^\n]*build/);
  assert.match(install, /Learning Companion\.app/);
  assert.doesNotMatch(install, /optional dependencies are installed on first use/i);
});

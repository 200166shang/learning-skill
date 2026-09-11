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

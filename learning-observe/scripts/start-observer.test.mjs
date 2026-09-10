import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { startObserver } from "./start-observer.mjs";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("starts a healthy observer and reuses it for the same workspace", async (context) => {
  const workspace = path.join(repository, "examples", "observer-demo");
  const first = await startObserver(workspace, { port: 4317 });
  context.after(() => { try { process.kill(first.pid, "SIGTERM"); } catch { /* already stopped */ } });
  assert.equal((await fetch(`${first.url}/api/view`)).status, 200);
  const second = await startObserver(workspace, { port: 4317 });
  assert.equal(second.url, first.url);
  assert.equal(second.pid, first.pid);
  assert.equal(second.reused, true);
});

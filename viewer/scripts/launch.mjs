import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const viewer = fileURLToPath(new URL("..", import.meta.url));
const result = spawnSync("npm", ["exec", "tauri", "--", "dev", "--", ...process.argv.slice(2)], {
  cwd: viewer,
  stdio: "inherit",
});
process.exit(result.status ?? 1);

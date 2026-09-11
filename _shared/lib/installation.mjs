import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";

export const INSTALL_MANIFEST = "learning-installation-manifest.json";
export const copyInstallationTree = (source, destination, options = {}) => cpSync(source, destination, { recursive: true, verbatimSymlinks: true, ...options });
export const sha256File = (file) => { const stat = lstatSync(file); const content = stat.isSymbolicLink() ? `symlink:${readlinkSync(file)}` : readFileSync(file); return createHash("sha256").update(content).digest("hex"); };
export function listFiles(root, relative = "") {
  const directory = path.join(root, relative); if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const child = path.posix.join(relative.replaceAll(path.sep, "/"), entry.name);
    if (child.split("/").includes("node_modules")) return [];
    return entry.isDirectory() ? listFiles(root, child) : [child];
  });
}
export function buildContentManifest(root, directories, sourceRevision, mode, sourceDirty = false) {
  const files = {}; for (const directory of directories) for (const relative of listFiles(root, directory)) files[relative] = sha256File(path.join(root, relative));
  return { manifestVersion: 1, sourceRevision, sourceDirty, mode, directories: [...directories], files };
}
export function verifyInstallation(root) {
  const manifestPath = path.join(root, INSTALL_MANIFEST);
  if (!existsSync(manifestPath)) return { ok: false, manifestPath, errors: ["installation manifest is missing"] };
  let manifest; try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch (error) { return { ok: false, manifestPath, errors: [`installation manifest is invalid: ${error.message}`] }; }
  const errors = [];
  const safe = (value) => typeof value === "string" && value.length > 0 && !path.posix.isAbsolute(value) && !value.includes("\\") && !value.split("/").includes("..") && path.posix.normalize(value) === value;
  if (manifest.manifestVersion !== 1) errors.push("unsupported or missing manifestVersion");
  if (!Array.isArray(manifest.directories) || manifest.directories.length === 0 || !manifest.directories.every(safe)) errors.push("directories must be a non-empty array of safe relative paths");
  if (typeof manifest.sourceRevision !== "string" || !/^(?:[0-9a-f]{40}|unknown)$/.test(manifest.sourceRevision)) errors.push("sourceRevision must be a git revision or unknown");
  if (typeof manifest.sourceDirty !== "boolean") errors.push("sourceDirty must be boolean");
  if (!["full", "runtime-only"].includes(manifest.mode)) errors.push("mode must be full or runtime-only");
  if (!manifest.files || typeof manifest.files !== "object" || Array.isArray(manifest.files) || Object.keys(manifest.files).length === 0) errors.push("files must be a non-empty object");
  else for (const [relative, hash] of Object.entries(manifest.files)) if (!safe(relative) || typeof hash !== "string" || !/^[0-9a-f]{64}$/.test(hash) || (Array.isArray(manifest.directories) && !manifest.directories.some((directory) => relative.startsWith(`${directory}/`)))) errors.push(`invalid manifest file entry: ${relative}`);
  if (errors.length) return { ok: false, manifestPath, errors };
  const resolvedRoot = realpathSync(root);
  for (const directory of manifest.directories) { const target = path.join(root, directory); if (!existsSync(target)) continue; const resolved = realpathSync(target); if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) errors.push(`directory escapes installation root: ${directory}`); }
  if (errors.length) return { ok: false, manifestPath, errors };
  for (const [relative, expected] of Object.entries(manifest.files || {})) {
    const target = path.join(root, relative); let stat; try { stat = lstatSync(target); } catch { errors.push(`missing: ${relative}`); continue; }
    if (!stat.isFile() && !stat.isSymbolicLink()) errors.push(`missing: ${relative}`);
    else if (stat.isSymbolicLink()) { const resolved = realpathSync(target); if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) errors.push(`symlink escapes installation root: ${relative}`); else if (sha256File(target) !== expected) errors.push(`changed: ${relative}`); }
    else if (sha256File(target) !== expected) errors.push(`changed: ${relative}`);
  }
  for (const directory of manifest.directories || []) for (const relative of listFiles(root, directory)) if (!(relative in (manifest.files || {})) && !relative.includes("/node_modules/")) errors.push(`unexpected: ${relative}`);
  return { ok: errors.length === 0, manifestPath, sourceRevision: manifest.sourceRevision, mode: manifest.mode, checkedFiles: Object.keys(manifest.files || {}).length, errors };
}

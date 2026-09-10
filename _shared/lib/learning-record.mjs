import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import YAML from "yaml";

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory).sort()) {
    const absolute = path.join(directory, entry);
    const stats = statSync(absolute);
    if (stats.isDirectory()) files.push(...markdownFiles(absolute));
    else if (stats.isFile() && entry.toLowerCase().endsWith(".md")) files.push(absolute);
  }
  return files;
}

export const normalizeNotePath = (workspace, absolutePath) => path.relative(path.resolve(workspace), absolutePath).split(path.sep).join("/");

export function parseKnowledgeNote(markdown, source = "KnowledgeNote", { allowLegacyRelations = false } = {}) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) return { record: null, body: markdown, warnings: [`malformed KnowledgeNote frontmatter: ${source}`] };
  try {
    const metadata = YAML.parse(match[1], { prettyErrors: true }) || {};
    if (!metadata.title || typeof metadata.title !== "string") return { record: null, body: markdown.slice(match[0].length), warnings: [`KnowledgeNote missing title: ${source}`] };
    const relations = Array.isArray(metadata.relations) ? metadata.relations : [];
    const warnings = [];
    const supported = new Set(["requires", "part-of", "contrasts-with"]);
    for (const relation of relations) {
      if (!relation || typeof relation !== "object") continue;
      if (relation.type === "derived-from") {
        if (!allowLegacyRelations) warnings.push(`legacy relation is migration-only: ${source}: derived-from`);
        continue;
      }
      if (typeof relation.type === "string" && !supported.has(relation.type)) warnings.push(`unsupported KnowledgeNote relation: ${source}: ${relation.type}`);
      if (supported.has(relation.type) && (typeof relation.ref !== "string" || !relation.ref.trim())) warnings.push(`KnowledgeNote relation missing ref: ${source}: ${relation.type}`);
    }
    const body = markdown.slice(match[0].length);
    if (!body.trim()) warnings.push(`KnowledgeNote body is empty: ${source}`);
    return { note: { title: metadata.title.trim(), tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [], sources: Array.isArray(metadata.sources) ? metadata.sources : [], relations }, body, warnings };
  } catch (error) {
    return { record: null, body: markdown, warnings: [`malformed KnowledgeNote frontmatter: ${source}: ${error.message}`] };
  }
}

export function readLearningRecords(workspace) {
  const root = path.resolve(workspace);
  const warnings = [];
  const records = [];
  for (const absolutePath of markdownFiles(path.join(root, "notes"))) {
    const notePath = normalizeNotePath(root, absolutePath);
    const parsed = parseKnowledgeNote(readFileSync(absolutePath, "utf8"), notePath, { allowLegacyRelations: true });
    warnings.push(...parsed.warnings);
    if (parsed.note) records.push({ ...parsed.note, notePath, absolutePath, body: parsed.body });
  }
  return { records, warnings };
}

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

export function parseLearningRecord(markdown, source = "KnowledgeNote") {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) return { record: null, body: markdown, warnings: [`malformed KnowledgeNote frontmatter: ${source}`] };
  try {
    const metadata = YAML.parse(match[1], { prettyErrors: true }) || {};
    if (!metadata.title || typeof metadata.title !== "string") return { record: null, body: markdown.slice(match[0].length), warnings: [`KnowledgeNote missing title: ${source}`] };
    return { record: { title: metadata.title.trim(), recordType: typeof metadata.record_type === "string" ? metadata.record_type : "note", createdAt: metadata.created_at ? String(metadata.created_at) : null, tags: Array.isArray(metadata.tags) ? metadata.tags.map(String) : [], sources: Array.isArray(metadata.sources) ? metadata.sources : [], relations: Array.isArray(metadata.relations) ? metadata.relations : [] }, body: markdown.slice(match[0].length), warnings: [] };
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
    const parsed = parseLearningRecord(readFileSync(absolutePath, "utf8"), notePath);
    warnings.push(...parsed.warnings);
    if (parsed.record) records.push({ ...parsed.record, notePath, absolutePath, body: parsed.body });
  }
  return { records, warnings };
}

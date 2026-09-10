import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildLearningView } from "../../_shared/lib/learning-view-model.mjs";
import { parseLearningRecord } from "../../_shared/lib/learning-record.mjs";

export class LearningService {
  constructor(workspace) { this.workspace = path.resolve(workspace); }
  buildView() { return buildLearningView(this.workspace); }
  async readNote(notePath) {
    if (!notePath || typeof notePath !== "string") throw Object.assign(new Error("note path is required"), { statusCode: 400 });
    const notesRoot = path.resolve(this.workspace, "notes");
    const target = path.resolve(this.workspace, notePath);
    if (target !== notesRoot && !target.startsWith(`${notesRoot}${path.sep}`)) throw Object.assign(new Error("note path must stay inside workspace/notes"), { statusCode: 403 });
    if (path.extname(target).toLowerCase() !== ".md") throw Object.assign(new Error("only Markdown notes can be read"), { statusCode: 400 });
    try {
      const normalizedPath = path.relative(this.workspace, target).split(path.sep).join("/");
      const source = await readFile(target, "utf8");
      const parsed = parseLearningRecord(source, normalizedPath);
      return { path: normalizedPath, title: parsed.record?.title || path.basename(target, ".md"), markdown: parsed.record ? parsed.body : source, warnings: parsed.warnings };
    }
    catch (error) { if (error.code === "ENOENT") throw Object.assign(new Error("note not found"), { statusCode: 404 }); throw error; }
  }
}

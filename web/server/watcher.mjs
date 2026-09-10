import path from "node:path";
import chokidar from "chokidar";

export function watchLearningFiles(workspace, onChange, debounceMs = 180) {
  let timer;
  const notesRoot = path.join(workspace, "notes");
  const watcher = chokidar.watch([path.join(workspace, ".learning", "state.yaml"), notesRoot, path.join(workspace, "MISSION.md"), path.join(workspace, "SYNTHESIS.md")], { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 25 } });
  watcher.on("all", (_event, changedPath) => {
    if (changedPath.startsWith(notesRoot) && path.extname(changedPath).toLowerCase() !== ".md") return;
    clearTimeout(timer);
    timer = setTimeout(onChange, debounceMs);
  });
  return { close: async () => { clearTimeout(timer); await watcher.close(); } };
}

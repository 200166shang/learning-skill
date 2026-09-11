export function projectLearningView(journey, evidence, state, targets) {
  if (state.mode === "idle") return { mode: "idle", episode: null, path: [], currentQuestionId: null, depth: 0, popDestinationQuestionId: null };
  const byId = new Map(journey.questions.map((question) => [question.id, question]));
  const episode = journey.episodes.find((candidate) => candidate.id === state.activeEpisodeId);
  const path = state.focusStack.map((id) => {
    const question = byId.get(id);
    return { questionId: id, title: question.question, whyNeeded: question.whyNeeded, resumeCheckpoint: question.resumeCheckpoint, targetIds: targets.targets.filter((target) => target.origin.questionIds.includes(id)).map((target) => target.id) };
  });
  return { mode: "active", episode: { id: episode.id, rootQuestionId: episode.rootQuestionId, rootTitle: byId.get(episode.rootQuestionId).question }, path, currentQuestionId: state.focusStack.at(-1), depth: path.length, popDestinationQuestionId: state.focusStack.at(-2) || null };
}

const escapeMermaid = (value) => String(value).replaceAll("\\", "\\\\").replaceAll('"', "&quot;").replaceAll("\n", " ");
export function renderLearningView(projection, format = "text") {
  if (format === "json") return `${JSON.stringify(projection, null, 2)}\n`;
  if (format === "text") {
    if (projection.mode === "idle") return "Learning: IDLE\n";
    const lines = [`Episode: ${projection.episode.rootTitle}`, "", "Path:"];
    projection.path.forEach((item, index) => { if (index) lines.push(`  ↓ because: ${item.whyNeeded}`); lines.push(`${index === projection.path.length - 1 ? "▶ " : ""}${item.title}${item.targetIds.length ? ` [${item.targetIds.join(", ")}]` : ""}`); });
    lines.push("", `Depth: ${projection.depth}`, `After pass: ${projection.popDestinationQuestionId ? `POP → ${projection.path.at(-2).title}` : "root close → IDLE"}`);
    if (projection.path.at(-1).resumeCheckpoint) lines.push(`Resume: "${projection.path.at(-1).resumeCheckpoint}"`);
    return `${lines.join("\n")}\n`;
  }
  if (format === "mermaid") {
    const lines = ["flowchart TD"];
    for (const item of projection.path) lines.push(`    ${item.questionId}["${escapeMermaid(item.title)}${item.targetIds.length ? ` · ${item.targetIds.join(",")}` : ""}"]`);
    for (let index = 1; index < projection.path.length; index += 1) lines.push(`    ${projection.path[index - 1].questionId} --> ${projection.path[index].questionId}`);
    return `${lines.join("\n")}\n`;
  }
  throw new Error(`unsupported view format: ${format}`);
}

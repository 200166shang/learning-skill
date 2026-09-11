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

export function projectLearningGoalView(goal, journey, evidence, state, targets) {
  const episodes = new Map(journey.episodes.map((episode) => [episode.id, episode]));
  const questions = new Map(journey.questions.map((question) => [question.id, question]));
  const activeView = projectLearningView(journey, evidence, state, targets);
  return {
    goal: { id: goal.id, title: goal.title, objective: goal.objective, closed: Boolean(goal.closedAt), sources: goal.sources },
    roots: goal.rootIntents.map((root) => {
      const episode = root.episodeId ? episodes.get(root.episodeId) : null, rootQuestion = episode ? questions.get(episode.rootQuestionId) : null;
      const targetIds = episode ? targets.targets.filter((target) => target.origin.episodeId === episode.id && target.origin.questionIds.includes(episode.rootQuestionId)).map((target) => target.id) : [];
      return { rootIntentId: root.id, question: root.question, derivedStatus: !episode ? "pending" : episode.status === "closed" ? "completed" : episode.status, episodeId: episode?.id || null, rootQuestionId: rootQuestion?.id || null, targetIds, ...(episode?.id === state.activeEpisodeId ? { activePath: activeView.path } : {}) };
    }),
  };
}

export function projectLearningGoals(goals, journey) {
  const episodes = new Map(journey.episodes.map((episode) => [episode.id, episode]));
  return goals.goals.map((goal) => {
    const counts = { pending: 0, active: 0, completed: 0, abandoned: 0 };
    for (const root of goal.rootIntents) { const status = root.episodeId ? (episodes.get(root.episodeId)?.status === "closed" ? "completed" : episodes.get(root.episodeId)?.status) : "pending"; if (status) counts[status] += 1; }
    return { id: goal.id, title: goal.title, closed: Boolean(goal.closedAt), counts };
  });
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

export function renderLearningGoalView(projection, format = "text") {
  if (format === "json") return `${JSON.stringify(projection, null, 2)}\n`;
  if (format !== "text") throw new Error(`unsupported goal view format: ${format}`);
  const lines = [`Goal ${projection.goal.id}: ${projection.goal.title}`, `Objective: ${projection.goal.objective}`, `Sources: ${projection.goal.sources.length}${projection.goal.sources.length ? ` (${[...new Set(projection.goal.sources.map((source) => source.role))].join(", ")})` : ""}`, "", "Roots:"];
  const symbol = { pending: "○", active: "▶", completed: "✓", abandoned: "×" };
  for (const root of projection.roots) lines.push(`${symbol[root.derivedStatus]} ${root.rootIntentId}  ${root.question}${root.episodeId ? ` → ${root.episodeId}` : ""}${root.targetIds.length ? ` → ${root.targetIds.join(", ")}` : ""}`);
  const active = projection.roots.find((root) => root.derivedStatus === "active");
  if (active?.activePath?.length) { lines.push("", "Current path:"); active.activePath.forEach((item, index) => { if (index) lines.push(`  ↓ because: ${item.whyNeeded}`); lines.push(`${index === active.activePath.length - 1 ? "▶ " : ""}${item.title}`); }); }
  return `${lines.join("\n")}\n`;
}

export function renderLearningGoals(projection, format = "text") {
  if (format === "json") return `${JSON.stringify(projection, null, 2)}\n`;
  if (format !== "text") throw new Error(`unsupported goals view format: ${format}`);
  if (!projection.length) return "Learning Goals: none\n";
  return `${projection.map((goal) => `${goal.id}  ${goal.title}  ${goal.counts.completed} completed / ${goal.counts.active} active / ${goal.counts.pending} pending${goal.counts.abandoned ? ` / ${goal.counts.abandoned} abandoned` : ""}`).join("\n")}\n`;
}

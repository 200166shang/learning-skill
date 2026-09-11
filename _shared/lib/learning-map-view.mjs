const derivedEpisodeStatus = (episode) => episode?.status === "closed" ? "completed" : episode?.status || "pending";

function targetIdsForQuestion(targets, questionId) {
  return targets.targets
    .filter((target) => target.origin.questionIds.includes(questionId))
    .map((target) => target.id);
}
function goalSummary(goal, journey) {
  const episodes = new Map(journey.episodes.map((episode) => [episode.id, episode]));
  const counts = { pending: 0, active: 0, completed: 0, abandoned: 0 };
  for (const root of goal.rootIntents) counts[derivedEpisodeStatus(episodes.get(root.episodeId))] += 1;
  return { id: goal.id, title: goal.title, objective: goal.objective, closed: Boolean(goal.closedAt), counts };
}

function findGoalContext(goals, state, requestedGoalId) {
  if (requestedGoalId) {
    const goal = goals.goals.find((candidate) => candidate.id === requestedGoalId);
    if (!goal) throw new Error(`goal not found: ${requestedGoalId}`);
    return goal;
  }
  if (state.mode !== "active") return null;
  return goals.goals.find((candidate) => candidate.rootIntents.some((root) => root.episodeId === state.activeEpisodeId)) || null;
}

/**
 * Builds the stable, graph-friendly read model used by the desktop viewer.
 * Inputs must already have passed canonical workspace validation.
 */
export function projectLearningMap({ goals, journey, evidence, state, targets }, options = {}) {
  const selectedGoal = findGoalContext(goals, state, options.goalId);
  const activeEpisode = state.mode === "active"
    ? journey.episodes.find((episode) => episode.id === state.activeEpisodeId)
    : null;
  const selectedEpisode = activeEpisode && (!selectedGoal || selectedGoal.rootIntents.some((root) => root.episodeId === activeEpisode.id))
    ? activeEpisode
    : null;
  const activePath = new Set(selectedEpisode ? state.focusStack : []);
  const currentQuestionId = selectedEpisode ? state.focusStack.at(-1) : null;
  const questions = selectedEpisode
    ? journey.questions.filter((question) => question.episodeId === selectedEpisode.id)
    : [];
  const questionById = new Map(questions.map((question) => [question.id, question]));
  const nodes = [];
  const edges = [];

  if (selectedGoal) {
    nodes.push({ id: `goal:${selectedGoal.id}`, kind: "goal", title: selectedGoal.title, status: selectedGoal.closedAt ? "completed" : "active-context", objective: selectedGoal.objective });
    for (const root of selectedGoal.rootIntents) {
      const episode = root.episodeId ? journey.episodes.find((candidate) => candidate.id === root.episodeId) : null;
      const status = derivedEpisodeStatus(episode);
      nodes.push({
        id: `root:${root.id}`,
        kind: "root",
        title: root.question,
        status,
        rootIntentId: root.id,
        episodeId: root.episodeId,
        targetIds: episode ? targetIdsForQuestion(targets, episode.rootQuestionId) : [],
      });
      edges.push({ source: `goal:${selectedGoal.id}`, target: `root:${root.id}`, kind: "contains" });
    }
  }

  const selectedRoot = selectedGoal?.rootIntents.find((root) => root.episodeId === selectedEpisode?.id) || null;
  for (const question of questions) {
    const status = question.id === currentQuestionId ? "current" : activePath.has(question.id) ? "active-path" : question.status === "closed" ? "completed" : "open";
    nodes.push({
      id: `question:${question.id}`,
      kind: "question",
      title: question.question,
      status,
      questionId: question.id,
      episodeId: question.episodeId,
      parentQuestionId: question.parentId,
      whyNeeded: question.whyNeeded,
      resumeCheckpoint: question.resumeCheckpoint,
      noteRefs: question.noteRefs,
      targetIds: targetIdsForQuestion(targets, question.id),
    });
    if (question.parentId) edges.push({ source: `question:${question.parentId}`, target: `question:${question.id}`, kind: "blocking-child" });
  }
  if (selectedEpisode && questionById.has(selectedEpisode.rootQuestionId)) {
    if (selectedRoot) edges.push({ source: `root:${selectedRoot.id}`, target: `question:${selectedEpisode.rootQuestionId}`, kind: "episode-root" });
  }

  const currentQuestion = currentQuestionId ? questionById.get(currentQuestionId) : null;
  return {
    version: 1,
    mode: state.mode,
    goal: selectedGoal ? { id: selectedGoal.id, title: selectedGoal.title, objective: selectedGoal.objective, closed: Boolean(selectedGoal.closedAt) } : null,
    availableGoals: goals.goals.map((goal) => goalSummary(goal, journey)),
    roots: selectedGoal ? selectedGoal.rootIntents.map((root) => {
      const episode = root.episodeId ? journey.episodes.find((candidate) => candidate.id === root.episodeId) : null;
      return { id: root.id, question: root.question, status: derivedEpisodeStatus(episode), episodeId: root.episodeId };
    }) : [],
    graph: { nodes, edges },
    current: currentQuestion ? {
      episodeId: selectedEpisode.id,
      rootIntentId: selectedRoot?.id || null,
      questionId: currentQuestion.id,
      depth: state.focusStack.length,
      whyNeeded: currentQuestion.whyNeeded,
      popDestinationQuestionId: state.focusStack.at(-2) || null,
      resumeCheckpoint: currentQuestion.resumeCheckpoint,
      noteRefs: currentQuestion.noteRefs,
    } : null,
  };
}

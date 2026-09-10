export function detectRuntimeTransition(previousStack = [], currentStack = [], now = new Date()) {
  const before = previousStack.map((frame) => frame.id);
  const after = currentStack.map((frame) => frame.id);
  if (before.join("|") === after.join("|")) return null;
  let type = "ROUTE UPDATED";
  if (after.length === before.length + 1 && before.every((id, index) => id === after[index])) type = "DIVE";
  else if (before.length === after.length + 1 && after.every((id, index) => id === before[index])) type = "BACKTRACK";
  return { id: `${now.getTime()}-${type.toLowerCase().replaceAll(" ", "-")}`, type, at: now.toISOString(), from: previousStack.at(-1)?.question || null, to: currentStack.at(-1)?.question || null };
}

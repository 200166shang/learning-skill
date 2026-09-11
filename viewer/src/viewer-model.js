export function toCytoscapeElements(viewModel) {
  const nodes = viewModel.graph.nodes.map((node) => ({ data: { ...node, label: node.title } }));
  const edges = viewModel.graph.edges.map((edge, index) => ({ data: { ...edge, id: `${edge.kind}:${edge.source}:${edge.target}:${index}` } }));
  return [...nodes, ...edges];
}

export function createRefreshController({ load, onUpdate, onError }) {
  let fingerprint = null;
  return async function refresh(goalId = null) {
    try {
      const viewModel = await load(goalId);
      const next = JSON.stringify(viewModel);
      if (next === fingerprint) return false;
      fingerprint = next;
      onUpdate(viewModel);
      return true;
    } catch (error) {
      const next = `error:${String(error)}`;
      if (next !== fingerprint) {
        fingerprint = next;
        onError(error);
      }
      return false;
    }
  };
}

export async function togglePin(windowApi, button, labels = { on: "Pinned", off: "Pin" }) {
  const next = button.getAttribute("aria-pressed") !== "true";
  await windowApi.setAlwaysOnTop(next);
  button.setAttribute("aria-pressed", String(next));
  button.textContent = next ? labels.on : labels.off;
  return next;
}

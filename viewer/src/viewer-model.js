export function nodeDimensions(title, kind) {
  const length = [...String(title ?? "")].length;
  const nodeWidth = kind === "goal" ? 228 : length > 18 ? 220 : 196;
  const charactersPerLine = nodeWidth >= 220 ? 18 : 16;
  const lines = Math.max(1, Math.min(4, Math.ceil(length / charactersPerLine)));
  return { nodeWidth, nodeHeight: Math.max(62, 24 + lines * 20) };
}

export function wrapLabel(title, charactersPerLine, maxLines = 4) {
  const characters = [...String(title ?? "")];
  if (characters.length <= charactersPerLine) return characters.join("");
  const lines = [];
  for (let offset = 0; offset < characters.length && lines.length < maxLines; offset += charactersPerLine) {
    lines.push(characters.slice(offset, offset + charactersPerLine).join(""));
  }
  if (characters.length > charactersPerLine * maxLines) {
    lines[maxLines - 1] = `${[...lines[maxLines - 1]].slice(0, charactersPerLine - 1).join("")}…`;
  }
  return lines.join("\n");
}

export function toCytoscapeElements(viewModel) {
  const nodes = viewModel.graph.nodes.map((node) => {
    const dimensions = nodeDimensions(node.title, node.kind);
    const charactersPerLine = dimensions.nodeWidth >= 220 ? 18 : 16;
    return { data: { ...node, ...dimensions, label: wrapLabel(node.title, charactersPerLine), labelMaxWidth: dimensions.nodeWidth - 36 } };
  });
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

import cytoscape from "cytoscape";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createRefreshController, toCytoscapeElements, togglePin } from "./viewer-model.js";
import "./style.css";

const graphElement = document.querySelector("#graph");
const details = document.querySelector("#details");
const notice = document.querySelector("#notice");
const goalList = document.querySelector("#goal-list");
const pin = document.querySelector("#pin");
let selectedGoalId = null;
let latest = null;

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const graph = cytoscape({
  container: graphElement,
  elements: [],
  layout: { name: "breadthfirst", directed: true, padding: 28, spacingFactor: 1.15 },
  wheelSensitivity: 0.22,
  style: [
    { selector: "node", style: { "background-color": "#e8e5dd", color: "#282923", label: "data(label)", width: 118, height: 42, shape: "round-rectangle", "font-size": 11, "font-family": "Inter, system-ui, sans-serif", "text-wrap": "ellipsis", "text-max-width": 98, "border-width": 1, "border-color": "#c9c5ba" } },
    { selector: "node[kind = 'goal']", style: { "background-color": "#26352d", color: "#fbfaf6", width: 132, "border-color": "#26352d", "font-weight": 650 } },
    { selector: "node[kind = 'root']", style: { "background-color": "#dce7de", "border-color": "#8aa18d" } },
    { selector: "node[status = 'completed']", style: { opacity: 0.52, "border-style": "dashed" } },
    { selector: "node[status = 'active-path']", style: { "background-color": "#f1dfb5", "border-color": "#c29442", "border-width": 2 } },
    { selector: "node[status = 'current']", style: { "background-color": "#e56745", color: "#fffaf4", "border-color": "#9f3822", "border-width": 3, "font-weight": 700 } },
    { selector: "edge", style: { width: 1.5, "line-color": "#aaa69b", "target-arrow-color": "#aaa69b", "target-arrow-shape": "triangle", "curve-style": "bezier" } },
    { selector: ":selected", style: { "overlay-color": "#e56745", "overlay-opacity": 0.12, "overlay-padding": 7 } },
  ],
});

function value(label, content) {
  if (!content) return "";
  return `<div class="fact"><span>${escapeHtml(label)}</span><p>${escapeHtml(content)}</p></div>`;
}

function showDetails(node) {
  const data = node.data();
  const parent = data.parentQuestionId || (latest?.current?.questionId === data.questionId ? latest.current.popDestinationQuestionId : null);
  details.innerHTML = `<p class="eyebrow">${escapeHtml(data.kind.toUpperCase())} · ${escapeHtml(data.status)}</p><h2>${escapeHtml(data.title)}</h2>${value("Why needed", data.whyNeeded)}${value("After pass", parent ? `POP → ${parent}` : data.kind === "question" ? "Root closes → IDLE" : null)}${value("Resume", data.resumeCheckpoint)}${value("Episode", data.episodeId)}${value("Targets", data.targetIds?.join(", "))}${value("Objective", data.objective)}`;
}

function showGoalChoices(viewModel) {
  const shouldShow = !viewModel.goal && !viewModel.current && viewModel.availableGoals.length;
  goalList.hidden = !shouldShow;
  if (!shouldShow) return;
  goalList.innerHTML = `<p class="eyebrow">CHOOSE A GOAL TO VIEW</p>${viewModel.availableGoals.map((goal) => `<button type="button" data-goal="${escapeHtml(goal.id)}"><strong>${escapeHtml(goal.title)}</strong><span>${goal.counts.completed} complete · ${goal.counts.active} active · ${goal.counts.pending} pending</span></button>`).join("")}`;
}

function render(viewModel) {
  latest = viewModel;
  notice.hidden = true;
  document.querySelector("#goal-title").textContent = viewModel.goal?.title || (viewModel.current ? "Direct learning episode" : "Learning Companion");
  document.querySelector("#goal-objective").textContent = viewModel.goal?.objective || (viewModel.current ? "Question-first learning" : "Select a Goal to inspect its map");
  showGoalChoices(viewModel);
  graph.elements().remove();
  graph.add(toCytoscapeElements(viewModel));
  graph.layout({ name: "breadthfirst", directed: true, padding: 28, spacingFactor: 1.15 }).run();
  if (graph.nodes().length) graph.fit(undefined, 28);
  const current = viewModel.current && graph.getElementById(`question:${viewModel.current.questionId}`);
  if (current?.length) { current.select(); showDetails(current); }
  else details.innerHTML = `<p class="eyebrow">STATUS</p><h2>${viewModel.mode === "idle" ? "No active question" : "Select a node"}</h2><p class="muted">${viewModel.mode === "idle" ? "The Learning runtime is idle." : "Question context will appear here."}</p>`;
}

function showError(error) {
  notice.hidden = false;
  const message = String(error).replace(/^Error:\s*/, "");
  notice.textContent = /workspace is empty/i.test(message)
    ? "No learning workspace found. Start learning in Codex first."
    : message;
}

const refresh = createRefreshController({
  load: (goalId) => invoke("read_learning_map", { goal: goalId }),
  onUpdate: render,
  onError: showError,
});

graph.on("tap", "node", (event) => showDetails(event.target));
goalList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-goal]");
  if (!button) return;
  selectedGoalId = button.dataset.goal;
  refresh(selectedGoalId);
});
pin.addEventListener("click", () => togglePin(getCurrentWindow(), pin).catch(showError));

await refresh(selectedGoalId);
setInterval(() => refresh(selectedGoalId), 750);

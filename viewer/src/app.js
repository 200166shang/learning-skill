import cytoscape from "cytoscape";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { copyFor, otherLanguage, preferredLanguage } from "./i18n.js";
import { createRefreshController, toCytoscapeElements, togglePin } from "./viewer-model.js";
import "./style.css";

const graphElement = document.querySelector("#graph");
const details = document.querySelector("#details");
const notice = document.querySelector("#notice");
const goalList = document.querySelector("#goal-list");
const pin = document.querySelector("#pin");
const languageButton = document.querySelector("#language");
let selectedGoalId = null;
let latest = null;
let latestError = null;
let language = preferredLanguage(navigator.language, localStorage.getItem("learning-companion-language"));

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
  minZoom: 0.4,
  maxZoom: 1.5,
  wheelSensitivity: 0.22,
  style: [
    { selector: "node", style: { "background-color": "#e8e5dd", color: "#282923", label: "data(label)", width: "data(nodeWidth)", height: "data(nodeHeight)", shape: "round-rectangle", "font-size": 12, "font-family": "Avenir Next, PingFang SC, sans-serif", "font-weight": 600, "line-height": 1.35, "text-wrap": "wrap", "text-max-width": "data(labelMaxWidth)", "text-valign": "center", "text-halign": "center", "border-width": 1, "border-color": "#c9c5ba" } },
    { selector: "node[kind = 'goal']", style: { "background-color": "#26352d", color: "#fbfaf6", "border-color": "#26352d", "font-weight": 700 } },
    { selector: "node[kind = 'root']", style: { "background-color": "#dce7de", "border-color": "#8aa18d" } },
    { selector: "node[status = 'completed']", style: { opacity: 0.52, "border-style": "dashed" } },
    { selector: "node[status = 'active-path']", style: { "background-color": "#f1dfb5", "border-color": "#c29442", "border-width": 2 } },
    { selector: "node[status = 'current']", style: { "background-color": "#e56745", color: "#24150f", "border-color": "#9f3822", "border-width": 3, "font-weight": 700 } },
    { selector: "edge", style: { width: 1.5, "line-color": "#aaa69b", "target-arrow-color": "#aaa69b", "target-arrow-shape": "triangle", "curve-style": "bezier" } },
    { selector: ":selected", style: { "overlay-color": "#e56745", "overlay-opacity": 0.12, "overlay-padding": 7 } },
  ],
});

function value(label, content) {
  if (!content) return "";
  return `<div class="fact"><span>${escapeHtml(label)}</span><p>${escapeHtml(content)}</p></div>`;
}

function showDetails(node) {
  const copy = copyFor(language);
  const data = node.data();
  const parent = data.parentQuestionId || (latest?.current?.questionId === data.questionId ? latest.current.popDestinationQuestionId : null);
  details.innerHTML = `<p class="eyebrow">${escapeHtml(copy.kinds[data.kind] || data.kind)} · ${escapeHtml(copy.statuses[data.status] || data.status)}</p><h2>${escapeHtml(data.title)}</h2>${value(copy.whyNeeded, data.whyNeeded)}${value(copy.afterPass, parent ? `POP → ${parent}` : data.kind === "question" ? copy.rootCloses : null)}${value(copy.resume, data.resumeCheckpoint)}${value(copy.episode, data.episodeId)}${value(copy.targets, data.targetIds?.join(", "))}${value(copy.objective, data.objective)}`;
}

function showGoalChoices(viewModel) {
  const copy = copyFor(language);
  const shouldShow = !viewModel.goal && !viewModel.current && viewModel.availableGoals.length;
  goalList.hidden = !shouldShow;
  if (!shouldShow) return;
  goalList.innerHTML = `<p class="eyebrow">${copy.chooseGoal}</p>${viewModel.availableGoals.map((goal) => `<button type="button" data-goal="${escapeHtml(goal.id)}"><strong>${escapeHtml(goal.title)}</strong><span>${goal.counts.completed} ${copy.complete} · ${goal.counts.active} ${copy.active} · ${goal.counts.pending} ${copy.pending}</span></button>`).join("")}`;
}

function render(viewModel) {
  const copy = copyFor(language);
  latest = viewModel;
  latestError = null;
  notice.hidden = true;
  document.querySelector("#goal-title").textContent = viewModel.goal?.title || (viewModel.current ? copy.directEpisode : copy.companion);
  document.querySelector("#goal-objective").textContent = viewModel.goal?.objective || (viewModel.current ? copy.questionFirst : copy.selectGoalHint);
  showGoalChoices(viewModel);
  graph.elements().remove();
  graph.add(toCytoscapeElements(viewModel));
  graph.layout({ name: "breadthfirst", directed: true, padding: 28, spacingFactor: 1.15 }).run();
  if (graph.nodes().length) graph.fit(undefined, 28);
  const current = viewModel.current && graph.getElementById(`question:${viewModel.current.questionId}`);
  if (current?.length) { current.select(); showDetails(current); }
  else details.innerHTML = `<p class="eyebrow">${copy.status}</p><h2>${viewModel.mode === "idle" ? copy.noActive : copy.selectNode}</h2><p class="muted">${viewModel.mode === "idle" ? copy.runtimeIdle : copy.contextHere}</p>`;
}

function showError(error) {
  const copy = copyFor(language);
  latestError = error;
  notice.hidden = false;
  const message = String(error).replace(/^Error:\s*/, "");
  notice.textContent = /workspace is empty/i.test(message)
    ? copy.noWorkspace
    : message;
}

function applyLanguage() {
  const copy = copyFor(language);
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = copy.appTitle;
  document.querySelector("#map-label").textContent = copy.mapLabel;
  languageButton.textContent = copy.languageButton;
  languageButton.setAttribute("aria-label", copy.switchLanguage);
  const pinned = pin.getAttribute("aria-pressed") === "true";
  pin.textContent = pinned ? copy.pinned : copy.pin;
  pin.title = copy.pinTitle;
  if (latest) render(latest);
  else if (latestError) showError(latestError);
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
pin.addEventListener("click", () => {
  const copy = copyFor(language);
  togglePin(getCurrentWindow(), pin, { on: copy.pinned, off: copy.pin }).catch(showError);
});
languageButton.addEventListener("click", () => {
  language = otherLanguage(language);
  localStorage.setItem("learning-companion-language", language);
  applyLanguage();
});

applyLanguage();
await refresh(selectedGoalId);
setInterval(() => refresh(selectedGoalId), 750);

import { existsSync,mkdirSync,readFileSync,writeFileSync } from "node:fs";import path from "node:path";import YAML from "yaml";
export const idleLearningState=()=>({version:2,mode:"idle",activeEpisodeId:null,focusStack:[]});
export function normalizeLearningState(input){const w=[];const s=input&&typeof input==="object"?input:{};if(s.focus_stack!=null&&!Array.isArray(s.focus_stack))w.push("focus_stack must be an array");const stack=Array.isArray(s.focus_stack)?s.focus_stack.filter(x=>typeof x==="string"&&x.trim()).map(x=>x.trim()):[];return{state:{version:Number(s.version)||2,mode:s.mode==="active"?"active":"idle",activeEpisodeId:typeof s.active_episode_id==="string"&&s.active_episode_id.trim()?s.active_episode_id.trim():null,focusStack:stack},warnings:w};}
export function validateLearningState(s, j = null) {
  const warnings = [];
  if (s.mode === "idle" && (s.activeEpisodeId || s.focusStack.length)) warnings.push("idle state must be empty");
  if (s.mode === "active" && (!s.activeEpisodeId || !s.focusStack.length)) warnings.push("active state requires episode and focus_stack");
  if (new Set(s.focusStack).size !== s.focusStack.length) warnings.push("duplicate focus question");
  if (!j) return warnings;
  if (s.mode === "idle") {
    if (j.episodes.some((episode) => episode.status === "active")) warnings.push("idle state cannot leave an active Episode");
    return warnings;
  }

  const episode = j.episodes.find((candidate) => candidate.id === s.activeEpisodeId);
  const byId = new Map(j.questions.map((question) => [question.id, question]));
  if (!episode || episode.status !== "active") warnings.push("active episode is missing or closed");
  for (const [index, id] of s.focusStack.entries()) {
    const question = byId.get(id);
    if (!question || question.episodeId !== s.activeEpisodeId || question.status !== "open") warnings.push(`invalid open focus question: ${id}`);
    if (index && question?.parentId !== s.focusStack[index - 1]) warnings.push(`focus_stack is not a parent chain at: ${id}`);
  }
  if (s.focusStack[0] !== episode?.rootQuestionId) warnings.push("focus_stack does not start at root");

  const openIds = j.questions
    .filter((question) => question.episodeId === s.activeEpisodeId && question.status === "open")
    .map((question) => question.id);
  const focusIds = new Set(s.focusStack);
  if (openIds.length !== s.focusStack.length || openIds.some((id) => !focusIds.has(id))) {
    warnings.push("active Episode open questions must exactly match focus_stack");
  }
  return warnings;
}
export function readLearningState(workspace){const target=path.join(path.resolve(workspace),".learning","state.yaml");if(!existsSync(target))return{...normalizeLearningState({}),exists:false,path:target};try{const r=normalizeLearningState(YAML.parse(readFileSync(target,"utf8"),{prettyErrors:true}));return{...r,exists:true,warnings:[...r.warnings,...validateLearningState(r.state)],path:target};}catch(e){return{...normalizeLearningState({}),exists:true,warnings:[`malformed state.yaml: ${e.message}`],path:target};}}
export function writeLearningState(workspace,s,j=null){const w=validateLearningState(s,j);if(w.length)throw new Error(`invalid learning state: ${w.join("; ")}`);const target=path.join(path.resolve(workspace),".learning","state.yaml");mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,YAML.stringify({version:2,mode:s.mode,active_episode_id:s.activeEpisodeId,focus_stack:s.focusStack},{lineWidth:0}));return target;}

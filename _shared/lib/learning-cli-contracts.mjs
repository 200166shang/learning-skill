const object = (required, properties) => ({ type: "object", required, properties, additionalProperties: true });
const nonempty = { type: "string", minLength: 1 }, strings = { type: "array", items: nonempty }, kinds = { enum: ["memory", "concept", "procedure", "design"] };
const source = object(["ref", "role"], { ref: nonempty, role: { enum: ["notes", "code", "transcript", "doc", "other"] } });
const targetMetadata = object(["title", "kind"], { title: nonempty, kind: kinds, noteRefs: strings, sourceRefs: strings });
const startIntent = { ...object(["type"], { type: { const: "start" }, question: nonempty, goalId: nonempty, rootIntentId: nonempty, createdAt: { type: "string" } }), oneOf: [
  { required: ["question"], not: { anyOf: [{ required: ["goalId"] }, { required: ["rootIntentId"] }] } },
  { required: ["goalId", "rootIntentId"], not: { required: ["question"] } },
] };
export const GOAL_INTENT_SCHEMA = { $schema: "https://json-schema.org/draft/2020-12/schema", title: "Learning goal intent", oneOf: [
  object(["type", "title", "objective"], { type: { const: "create" }, title: nonempty, objective: nonempty, sources: { type: "array", items: source }, createdAt: { type: "string" } }),
  object(["type", "goalId", "questions"], { type: { const: "add_roots" }, goalId: nonempty, questions: { type: "array", minItems: 1, items: nonempty }, acceptedAt: { type: "string" } }),
  object(["type", "goalId"], { type: { const: "update" }, goalId: nonempty, title: nonempty, objective: nonempty, sources: { type: "array", items: source } }),
  object(["type", "goalId", "rootIntentId", "question"], { type: { const: "update_root" }, goalId: nonempty, rootIntentId: nonempty, question: nonempty }),
  object(["type", "goalId", "ref", "role"], { type: { const: "add_source" }, goalId: nonempty, ref: nonempty, role: source.properties.role }),
  object(["type", "goalId", "ref"], { type: { const: "remove_source" }, goalId: nonempty, ref: nonempty, role: source.properties.role }),
  object(["type", "goalId", "closedAt"], { type: { const: "close" }, goalId: nonempty, closedAt: nonempty }), object(["type"], { type: { const: "list" } }), object(["type", "goalId"], { type: { const: "show" }, goalId: nonempty }) ] };
export const TRANSITION_INTENT_SCHEMA = { $schema: "https://json-schema.org/draft/2020-12/schema", title: "Learning transition intent", oneOf: [
  startIntent,
  object(["type", "question", "whyNeeded", "resumeCheckpoint", "accepted", "relationship"], { type: { const: "push" }, question: { type: "string", minLength: 1 }, whyNeeded: { type: "string", minLength: 1 }, resumeCheckpoint: { type: "string", minLength: 1 }, accepted: { const: true }, relationship: { const: "blocking" }, createdAt: { type: "string" }, noteRefs: { type: "array", items: { type: "string" } } }),
  object(["type", "result", "independence"], { type: { const: "verify" }, result: { enum: ["pass", "uncertain", "fail"] }, independence: { enum: ["unaided", "light_hint", "strong_hint"] }, demonstrated: strings, gaps: strings, target: { ...targetMetadata, description: "Required only when a passing verification closes the root question; omit for child-question verification." }, createdAt: { type: "string" } }),
  object(["type", "questionId", "title", "kind"], { type: { const: "promote_target" }, questionId: nonempty, title: nonempty, kind: kinds, noteRefs: strings, sourceRefs: strings, createdAt: { type: "string" } }),
  object(["type", "targetId"], { type: { const: "update_target" }, targetId: nonempty, title: nonempty, kind: kinds, noteRefs: strings, sourceRefs: strings }),
  object(["type", "questionId", "noteRefs"], { type: { const: "set_note_refs" }, questionId: nonempty, noteRefs: strings }),
  object(["type", "replacements"], { type: { const: "replace_note_refs" }, replacements: { type: "array", minItems: 1, items: object(["from", "to"], { from: nonempty, to: nonempty }) } }) ] };
function matches(value, rule, location) { try { validateValue(value, rule, location); return true; } catch { return false; } }
function validateValue(value, rule, location) {
  if (rule.oneOf && rule.oneOf.filter((candidate) => matches(value, candidate, location)).length !== 1) throw new Error(`${location} must match exactly one supported shape`);
  if (rule.anyOf && !rule.anyOf.some((candidate) => matches(value, candidate, location))) throw new Error(`${location} must match a supported shape`);
  if (rule.not && matches(value, rule.not, location)) throw new Error(`${location} contains mutually exclusive fields`);
  if (rule.const !== undefined && value !== rule.const) throw new Error(`${location} must be ${JSON.stringify(rule.const)}`);
  if (rule.enum && !rule.enum.includes(value)) throw new Error(`${location} must be one of: ${rule.enum.join(", ")}`);
  if (rule.type === "string") { if (typeof value !== "string") throw new Error(`${location} must be a string`); if (rule.minLength && !value.trim()) throw new Error(`${location} must not be empty`); }
  if (rule.type === "array") { if (!Array.isArray(value)) throw new Error(`${location} must be an array`); if (rule.minItems && value.length < rule.minItems) throw new Error(`${location} requires at least ${rule.minItems} item(s)`); if (rule.items) value.forEach((item, index) => validateValue(item, rule.items, `${location}[${index}]`)); }
  if (rule.type === "object" && (!value || typeof value !== "object" || Array.isArray(value))) throw new Error(`${location} must be an object`);
  if (rule.required) for (const field of rule.required) if (value?.[field] === undefined) throw new Error(`${location}.${field} is required`);
  if (rule.properties) for (const [field, child] of Object.entries(value)) if (child !== undefined && rule.properties[field]) validateValue(child, rule.properties[field], `${location}.${field}`);
}
export function validateIntent(intent, schema, noun) {
  if (!intent || typeof intent !== "object" || Array.isArray(intent)) throw new Error(`${noun} intent is required`);
  const variant = schema.oneOf.find((entry) => entry.properties.type.const === intent.type); if (!variant) throw new Error(`unknown ${noun} command: ${intent.type}`);
  if (noun === "transition" && intent.type === "start") { const question = typeof intent.question === "string" && intent.question.trim().length > 0, goal = typeof intent.goalId === "string" && intent.goalId.trim().length > 0, root = typeof intent.rootIntentId === "string" && intent.rootIntentId.trim().length > 0; if (question && (goal || root)) throw new Error("start accepts either question or goalId/rootIntentId, not both"); if (goal !== root) throw new Error("goal-backed start requires both goalId and rootIntentId"); if (!question && !goal) throw new Error("direct start requires a question"); }
  validateValue(intent, variant, intent.type); return intent;
}

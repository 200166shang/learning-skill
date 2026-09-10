import assert from "node:assert/strict";
import test from "node:test";

import { parseKnowledgeNote } from "./learning-record.mjs";

test("KnowledgeNote parser follows the single current contract", () => {
  const parsed = parseKnowledgeNote(`---
title: PWM controls average motor voltage
tags: [PWM, motor]
sources:
  - type: repository
    ref: src/pwm.c
relations:
  - type: requires
    ref: notes/duty-cycle.md
---

# PWM controls average motor voltage

Reusable explanation.
`);
  assert.deepEqual(parsed.note, {
    title: "PWM controls average motor voltage",
    tags: ["PWM", "motor"],
    sources: [{ type: "repository", ref: "src/pwm.c" }],
    relations: [{ type: "requires", ref: "notes/duty-cycle.md" }],
  });
  assert.match(parsed.body, /Reusable explanation/);
  assert.deepEqual(parsed.warnings, []);
});

test("current KnowledgeNotes reject legacy traversal relations", () => {
  const parsed = parseKnowledgeNote(`---
title: Legacy note
relations:
  - type: derived-from
    ref: notes/parent.md
---
Body
`);
  assert.match(parsed.warnings.join("\n"), /legacy relation/);
});

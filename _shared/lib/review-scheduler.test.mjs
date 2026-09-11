import assert from "node:assert/strict";
import test from "node:test";
import { createInitialSchedule, getDueItems, mapReviewRating, scheduleAfterAttempt } from "./review-scheduler.mjs";

const now = "2026-09-11T04:00:00.000Z", item = { id: "r001", targetId: "k001", status: "active" };
test("domain outcomes map deterministically to FSRS ratings", () => {
  assert.equal(mapReviewRating({ result: "fail", independence: "unaided" }), "again");
  assert.equal(mapReviewRating({ result: "uncertain", independence: "unaided" }), "hard");
  assert.equal(mapReviewRating({ result: "pass", independence: "strong_hint" }), "hard");
  assert.equal(mapReviewRating({ result: "pass", independence: "light_hint" }), "good");
  assert.equal(mapReviewRating({ result: "pass", independence: "unaided" }), "easy");
});
test("fixed attempts produce deterministic pinned-FSRS schedules", () => {
  const initial = createInitialSchedule(item, now), failed = scheduleAfterAttempt(initial, { result: "fail", independence: "unaided" }, now), passed = scheduleAfterAttempt(initial, { result: "pass", independence: "unaided" }, now);
  assert.equal(initial.dueAt, now); assert.equal(failed.dueAt, "2026-09-11T04:01:00.000Z"); assert.equal(passed.dueAt, "2026-09-19T04:00:00.000Z");
});
test("due queries are read-only, filtered, and stably ordered", () => {
  const states = [{ ...createInitialSchedule({ id: "r002" }, now), dueAt: now }, { ...createInitialSchedule(item, now), dueAt: now }], before = structuredClone(states);
  assert.deepEqual(getDueItems([item, { id: "r002", targetId: "k002", status: "archived" }], states, now).map((entry) => entry.item.id), ["r001"]);
  assert.deepEqual(getDueItems([item], states, now, { targetId: "k001" }).map((entry) => entry.item.id), ["r001"]); assert.deepEqual(states, before);
});

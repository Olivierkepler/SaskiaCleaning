import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDispatchAssignmentRequest,
  canManageDispatchAssignment,
  classifyAssignmentMutationResponse,
  resolveSelectedCleanerId,
  shouldRefreshDispatchAfterAssignment,
} from "../app/lib/dispatch-assignment-pure";

test("Dispatch assignment actions are limited to open booking statuses", () => {
  for (const status of ["new", "contacted", "scheduled"]) {
    assert.equal(canManageDispatchAssignment(status), true);
  }
  for (const status of ["in_progress", "completed", "cancelled", "unknown"]) {
    assert.equal(canManageDispatchAssignment(status), false);
  }
});

test("Dispatch displays only API-provided cleaner candidates", () => {
  const apiCandidates = [{ id: "cleaner-a" }, { id: "cleaner-b" }];
  assert.equal(resolveSelectedCleanerId(apiCandidates, "cleaner-b"), "cleaner-b");
  assert.equal(resolveSelectedCleanerId(apiCandidates, "manager-not-in-list"), "");
  assert.deepEqual(apiCandidates.map((candidate) => candidate.id), ["cleaner-a", "cleaner-b"]);
});

test("assignment and reassignment requests always carry the expected state", () => {
  assert.deepEqual(
    buildDispatchAssignmentRequest({
      staffId: "cleaner-a",
      expectedAssignmentId: null,
    }),
    { staffId: "cleaner-a", expectedAssignmentId: null },
  );
  assert.deepEqual(
    buildDispatchAssignmentRequest({
      staffId: "cleaner-b",
      expectedAssignmentId: "assignment-current",
    }),
    { staffId: "cleaner-b", expectedAssignmentId: "assignment-current" },
  );
});

test("assignment success confirms and refreshes Dispatch; conflicts refresh too", () => {
  assert.equal(classifyAssignmentMutationResponse({ ok: true, status: 200 }), "success");
  assert.equal(shouldRefreshDispatchAfterAssignment({ ok: true, status: 200 }), true);
  assert.equal(classifyAssignmentMutationResponse({ ok: false, status: 409 }), "conflict");
  assert.equal(shouldRefreshDispatchAfterAssignment({ ok: false, status: 409 }), true);
  assert.equal(classifyAssignmentMutationResponse({ ok: false, status: 400 }), "error");
  assert.equal(shouldRefreshDispatchAfterAssignment({ ok: false, status: 400 }), false);
});

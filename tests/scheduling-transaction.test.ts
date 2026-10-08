import assert from "node:assert/strict";
import test from "node:test";
import {
  runSchedulingTransaction,
  SCHEDULING_LOCK_DOMAIN,
  type SchedulingTransactionClient,
} from "../app/lib/scheduling-transaction-pure";

function fixture() {
  const calls: string[] = [];
  const client: SchedulingTransactionClient = {
    query: async () => ({ rows: [] }),
    release: () => calls.push("release"),
  };
  return { calls, client };
}

test("scheduling transaction locks, operates on the connected client, commits, and releases", async () => {
  const { calls, client } = fixture();
  const result = await runSchedulingTransaction({
    connect: async () => { calls.push("connect"); return client; },
    begin: async (same) => { assert.equal(same, client); calls.push("begin"); },
    acquireLock: async (same) => { assert.equal(same, client); calls.push(`lock:${SCHEDULING_LOCK_DOMAIN}`); },
    operation: async (same) => { assert.equal(same, client); calls.push("operation"); return "ok"; },
    commit: async (same) => { assert.equal(same, client); calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  });

  assert.equal(result, "ok");
  assert.deepEqual(calls, [
    "connect", "begin", `lock:${SCHEDULING_LOCK_DOMAIN}`, "operation", "commit", "release",
  ]);
});

test("scheduling transaction rolls back failures and releases its client", async () => {
  const { calls, client } = fixture();
  await assert.rejects(() => runSchedulingTransaction({
    connect: async () => client,
    begin: async () => { calls.push("begin"); },
    acquireLock: async () => { calls.push("lock"); },
    operation: async () => { calls.push("operation"); throw new Error("failed"); },
    commit: async () => { calls.push("commit"); },
    rollback: async () => { calls.push("rollback"); },
  }), /failed/);
  assert.deepEqual(calls, ["begin", "lock", "operation", "rollback", "release"]);
});

test("shared scheduling lock serializes concurrent writer operations", async () => {
  let unlock: (() => void) | undefined;
  let held = false;
  const order: string[] = [];
  const acquire = async () => {
    while (held) await new Promise<void>((resolve) => setTimeout(resolve, 0));
    held = true;
  };
  const releaseLock = () => { held = false; unlock?.(); };
  const writer = (name: string) => runSchedulingTransaction({
    connect: async () => ({ query: async () => ({ rows: [] }), release: releaseLock }),
    begin: async () => undefined,
    acquireLock: acquire,
    operation: async () => {
      order.push(`${name}:start`);
      if (name === "first") await new Promise<void>((resolve) => { unlock = resolve; });
      order.push(`${name}:end`);
    },
    commit: async () => undefined,
    rollback: async () => undefined,
  });

  const first = writer("first");
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const second = writer("second");
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(order, ["first:start"]);
  unlock?.();
  await Promise.all([first, second]);
  assert.deepEqual(order, ["first:start", "first:end", "second:start", "second:end"]);
});

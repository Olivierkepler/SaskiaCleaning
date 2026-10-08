// lib/db.ts

import { AsyncLocalStorage } from "node:async_hooks";
import { neon } from "@neondatabase/serverless";

type TransactionQueryClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
};

type SchedulingContext = {
  client: TransactionQueryClient;
  afterCommit: Array<() => Promise<void>>;
};

const schedulingTransaction = new AsyncLocalStorage<SchedulingContext>();
const httpSql = neon(process.env.DATABASE_URL!);

function compileTemplate(strings: TemplateStringsArray, values: unknown[]) {
  let text = strings[0] ?? "";
  for (let index = 0; index < values.length; index += 1) {
    text += `$${index + 1}${strings[index + 1] ?? ""}`;
  }
  return text;
}

/**
 * Queries inside a scheduling transaction use its one interactive client.
 * All other application queries retain the existing Neon HTTP transport.
 */
export const sql = new Proxy(httpSql, {
  apply(target, thisArg, args: [TemplateStringsArray, ...unknown[]]) {
    const context = schedulingTransaction.getStore();
    if (!context) return Reflect.apply(target, thisArg, args);
    const [strings, ...values] = args;
    return context.client
      .query(compileTemplate(strings, values))
      .then((result) => result.rows);
  },
  get(target, property, receiver) {
    if (property === "query") {
      return (text: string, values?: unknown[]) => {
        const context = schedulingTransaction.getStore();
        if (!context) {
          return Reflect.get(target, property, receiver).call(target, text, values);
        }
        return context.client.query(text, values).then((result) => result.rows);
      };
    }
    return Reflect.get(target, property, receiver);
  },
});

export function runInSchedulingTransaction<T>(
  client: TransactionQueryClient,
  afterCommit: Array<() => Promise<void>>,
  operation: () => Promise<T>,
): Promise<T> {
  return schedulingTransaction.run({ client, afterCommit }, operation);
}

export function getSchedulingTransactionClient(): TransactionQueryClient | undefined {
  return schedulingTransaction.getStore()?.client;
}

export function deferSchedulingAfterCommit(operation: () => Promise<void>): void {
  const context = schedulingTransaction.getStore();
  if (!context) throw new Error("Scheduling side effect requires a scheduling transaction.");
  context.afterCommit.push(operation);
}

// lib/db.ts

import { AsyncLocalStorage } from "node:async_hooks";
import { neon } from "@neondatabase/serverless";
import { executeSqlTemplate } from "@/app/lib/transaction-sql-pure";

type TransactionQueryClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
};

type SchedulingContext = {
  client: TransactionQueryClient;
  afterCommit: Array<() => Promise<void>>;
};

const schedulingTransaction = new AsyncLocalStorage<SchedulingContext>();
const httpSql = neon(process.env.DATABASE_URL!);

/**
 * Queries inside a scheduling transaction use its one interactive client.
 * All other application queries retain the existing Neon HTTP transport.
 */
export const sql = new Proxy(httpSql, {
  apply(target, thisArg, args: [TemplateStringsArray, ...unknown[]]) {
    const context = schedulingTransaction.getStore();
    if (!context) return Reflect.apply(target, thisArg, args);
    const [strings, ...values] = args;
    return executeSqlTemplate(context.client, strings, values);
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

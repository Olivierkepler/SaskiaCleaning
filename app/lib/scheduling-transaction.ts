import "server-only";

import { Pool } from "@neondatabase/serverless";
import {
  getSchedulingTransactionClient,
  runInSchedulingTransaction,
} from "@/app/lib/db";
import {
  runSchedulingTransaction,
  SCHEDULING_LOCK_DOMAIN,
} from "@/app/lib/scheduling-transaction-pure";

type SchedulingQueryClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
  release: () => void;
};

let sharedPool: Pool | undefined;

function connectionUrl(): string {
  const applicationUrl = process.env.DATABASE_URL;
  const unpooledUrl = process.env.DATABASE_URL_UNPOOLED;
  if (!applicationUrl) throw new Error("Database connection is not configured.");
  if (!unpooledUrl) return applicationUrl;

  try {
    const app = new URL(applicationUrl);
    const direct = new URL(unpooledUrl);
    const normalizeHost = (host: string) => host.replace("-pooler.", ".");
    if (
      normalizeHost(app.hostname) !== normalizeHost(direct.hostname) ||
      app.username !== direct.username ||
      app.password !== direct.password ||
      app.pathname !== direct.pathname
    ) {
      throw new Error("Configured direct database endpoint does not match the application database.");
    }
    return unpooledUrl;
  } catch (error) {
    if (error instanceof Error && error.message.includes("does not match")) throw error;
    throw new Error("Configured database endpoint could not be verified.");
  }
}

/**
 * One global transaction-scoped lock serializes scheduling decisions with
 * every migrated scheduling writer. Keep external notifications after commit.
 */
export async function withSchedulingTransaction<T>(
  operation: (client: SchedulingQueryClient) => Promise<T>,
): Promise<T> {
  const currentClient = getSchedulingTransactionClient() as SchedulingQueryClient | undefined;
  if (currentClient) return operation(currentClient);

  sharedPool ??= new Pool({ connectionString: connectionUrl(), max: 10 });
  const afterCommit: Array<() => Promise<void>> = [];
  const result = await runSchedulingTransaction({
    connect: async () => (await sharedPool!.connect()) as unknown as SchedulingQueryClient,
    begin: async (client) => { await client.query("BEGIN"); },
    acquireLock: async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [SCHEDULING_LOCK_DOMAIN]);
    },
    operation: async (client) =>
      runInSchedulingTransaction(client, afterCommit, () => operation(client)),
    commit: async (client) => { await client.query("COMMIT"); },
    rollback: async (client) => { await client.query("ROLLBACK"); },
  });
  for (const task of afterCommit) {
    try {
      await task();
    } catch {
      console.error("Post-commit scheduling notification failed.");
    }
  }
  return result;
}

let savepointSequence = 0;

/** Recover a failed constraint-checked attempt without aborting the outer transaction. */
export async function withSchedulingSavepoint<T>(operation: () => Promise<T>): Promise<T> {
  const client = getSchedulingTransactionClient();
  if (!client) return operation();
  const name = `scheduling_attempt_${++savepointSequence}`;
  await client.query(`SAVEPOINT ${name}`);
  try {
    const result = await operation();
    await client.query(`RELEASE SAVEPOINT ${name}`);
    return result;
  } catch (error) {
    await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
    await client.query(`RELEASE SAVEPOINT ${name}`);
    throw error;
  }
}

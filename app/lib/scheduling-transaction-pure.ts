export const SCHEDULING_LOCK_DOMAIN = "saskia-cleaning:scheduling-mutations:v1";

export type SchedulingTransactionClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
  release: () => void;
};

export async function runSchedulingTransaction<T>(input: {
  connect: () => Promise<SchedulingTransactionClient>;
  begin: (client: SchedulingTransactionClient) => Promise<void>;
  acquireLock: (client: SchedulingTransactionClient) => Promise<void>;
  operation: (client: SchedulingTransactionClient) => Promise<T>;
  commit: (client: SchedulingTransactionClient) => Promise<void>;
  rollback: (client: SchedulingTransactionClient) => Promise<void>;
}): Promise<T> {
  const client = await input.connect();
  let transactionStarted = false;
  try {
    await input.begin(client);
    transactionStarted = true;
    await input.acquireLock(client);
    const result = await input.operation(client);
    await input.commit(client);
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await input.rollback(client);
      } catch {
        // Preserve the original failure; callers receive a controlled error.
      }
    }
    throw error;
  } finally {
    client.release();
  }
}

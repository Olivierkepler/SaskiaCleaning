export type TransactionSqlClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
};

export function compileSqlTemplate(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  let text = strings[0] ?? "";
  for (let index = 0; index < values.length; index += 1) {
    text += `$${index + 1}${strings[index + 1] ?? ""}`;
  }
  return text;
}

/** Execute a tagged SQL template with both its parameterized text and values. */
export async function executeSqlTemplate<T = unknown>(
  client: TransactionSqlClient,
  strings: TemplateStringsArray,
  values: unknown[],
): Promise<T[]> {
  const result = await client.query(compileSqlTemplate(strings, values), values);
  return result.rows as T[];
}

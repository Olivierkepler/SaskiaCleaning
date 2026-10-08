import assert from "node:assert/strict";
import test from "node:test";
import {
  compileSqlTemplate,
  executeSqlTemplate,
  type TransactionSqlClient,
} from "../app/lib/transaction-sql-pure";

function template(
  strings: string[],
): TemplateStringsArray {
  return Object.assign(strings, { raw: [...strings] }) as unknown as TemplateStringsArray;
}

test("transaction tagged SQL binds interpolated values to the matching placeholders", async () => {
  const calls: Array<{ text: string; values?: unknown[] }> = [];
  const client: TransactionSqlClient = {
    query: async (text, values) => {
      calls.push({ text, values });
      return { rows: [{ allowed: true }] };
    },
  };
  const strings = template([
    "SELECT is_active FROM staff_availability WHERE day_of_week = ",
    " AND is_active = ",
    " AND staff_id = ",
    "::uuid AND created_at >= ",
    "::timestamptz",
  ]);
  const values = [
    4,
    false,
    "synthetic-staff-id",
    new Date("2026-10-08T12:00:00.000Z"),
  ];

  const rows = await executeSqlTemplate<{ allowed: boolean }>(
    client,
    strings,
    values,
  );

  assert.deepEqual(calls, [{
    text: "SELECT is_active FROM staff_availability WHERE day_of_week = $1 AND is_active = $2 AND staff_id = $3::uuid AND created_at >= $4::timestamptz",
    values,
  }]);
  assert.deepEqual(rows, [{ allowed: true }]);
});

test("transaction SQL compilation numbers all interpolations in order", () => {
  assert.equal(
    compileSqlTemplate(template(["SELECT ", " + ", "::int, ", "::text"]), [
      10,
      null,
      "safe",
    ]),
    "SELECT $1 + $2::int, $3::text",
  );
});

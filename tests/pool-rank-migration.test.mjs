import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const POOL_RANK_MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/20260223195500_pool_rank_rpc.sql"
);
const SCHEMA_SNAPSHOT_PATH = resolve(process.cwd(), "supabase/schema.sql");

function assertPoolRankSql(sqlText) {
  assert.match(
    sqlText,
    /create or replace function public\.get_pool_rank\(p_user_id uuid default auth\.uid\(\)\)/i
  );
  assert.match(sqlText, /from public\.pool_entries pe/i);
  assert.match(sqlText, /where pe\.position <= \(select position from target\)/i);
  assert.match(sqlText, /grant execute on function public\.get_pool_rank\(uuid\) to authenticated;/i);
}

test("pool rank migration adds function and grant", () => {
  const sql = readFileSync(POOL_RANK_MIGRATION_PATH, "utf8");
  assertPoolRankSql(sql);
});

test("schema snapshot includes pool rank function", () => {
  const sql = readFileSync(SCHEMA_SNAPSHOT_PATH, "utf8");
  assertPoolRankSql(sql);
});

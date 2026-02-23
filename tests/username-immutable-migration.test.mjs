import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const USERNAME_MIGRATION_PATH = resolve(
  process.cwd(),
  "supabase/migrations/20260218163000_username_immutable.sql"
);
const SCHEMA_SNAPSHOT_PATH = resolve(process.cwd(), "supabase/schema.sql");

function assertUsernameImmutableSql(sqlText) {
  assert.match(
    sqlText,
    /create or replace function public\.prevent_username_change\(\)/i
  );
  assert.match(
    sqlText,
    /raise exception 'Username is immutable once set'/i
  );
  assert.match(
    sqlText,
    /create trigger trg_profiles_username_immutable/i
  );
  assert.match(sqlText, /before update on public\.profiles/i);
  assert.match(
    sqlText,
    /for each row execute procedure public\.prevent_username_change\(\);/i
  );
}

test("username immutable migration keeps function and trigger", () => {
  const sql = readFileSync(USERNAME_MIGRATION_PATH, "utf8");
  assertUsernameImmutableSql(sql);
});

test("schema snapshot keeps username immutable guard", () => {
  const sql = readFileSync(SCHEMA_SNAPSHOT_PATH, "utf8");
  assertUsernameImmutableSql(sql);
});

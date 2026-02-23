import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SCRIPT_PATH = resolve(process.cwd(), "scripts/pick-daily.mjs");

test("pick-daily skips selection before launch date", () => {
  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    env: {
      ...process.env,
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "dummy-service-key",
      PICK_DAY: "2026-02-22",
      LAUNCH_DATE: "2026-03-31",
    },
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");

  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.day, "2026-02-22");
  assert.equal(payload.launch_day, "2026-03-31");
  assert.equal(payload.selected_user_id, null);
  assert.equal(payload.username, null);
  assert.equal(payload.skipped, "before_launch_date");
});

test("pick-daily validates LAUNCH_DATE format", () => {
  const result = spawnSync(process.execPath, [SCRIPT_PATH], {
    env: {
      ...process.env,
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "dummy-service-key",
      PICK_DAY: "2026-03-31",
      LAUNCH_DATE: "31-03-2026",
    },
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /LAUNCH_DATE must use YYYY-MM-DD format/);
});

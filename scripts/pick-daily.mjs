const ISO_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_LAUNCH_DATE = "2026-03-31";

function validateIsoDay(value, envName) {
  if (!ISO_DAY_REGEX.test(value)) {
    throw new Error(`${envName} must use YYYY-MM-DD format`);
  }
}

function readSupabaseUrl() {
  const value = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("Missing required env var: SUPABASE_URL (or PUBLIC_SUPABASE_URL)");
  }
  return value.replace(/\/+$/, "");
}

function readSupabaseSecretKey() {
  const value =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error(
      "Missing required env var: SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return value;
}

function readCooldownDays() {
  const raw = process.env.COOLDOWN_DAYS || "90";
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3650) {
    throw new Error("COOLDOWN_DAYS must be an integer between 1 and 3650");
  }
  return parsed;
}

function readPickDay() {
  const raw = process.env.PICK_DAY || new Date().toISOString().slice(0, 10);
  validateIsoDay(raw, "PICK_DAY");
  return raw;
}

function readLaunchDay() {
  const raw = process.env.LAUNCH_DATE || DEFAULT_LAUNCH_DATE;
  validateIsoDay(raw, "LAUNCH_DATE");
  return raw;
}

async function callRpc(supabaseUrl, secretKey, fnName, payload) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${fnName}`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const error = new Error(`${fnName} failed (${response.status})`);
    // Attach structured context for caller-specific handling.
    error.status = response.status;
    error.body = parsed;
    throw error;
  }

  return parsed;
}

const supabaseUrl = readSupabaseUrl();
const supabaseSecretKey = readSupabaseSecretKey();
const cooldownDays = readCooldownDays();
const day = readPickDay();
const launchDay = readLaunchDay();

if (day < launchDay) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        day,
        launch_day: launchDay,
        cooldown_days: cooldownDays,
        selected_user_id: null,
        username: null,
        skipped: "before_launch_date",
      },
      null,
      2
    )
  );
  process.exit(0);
}

let selectedUserId = null;

try {
  selectedUserId = await callRpc(
    supabaseUrl,
    supabaseSecretKey,
    "pick_daily_chosen",
    { p_day: day, p_cooldown_days: cooldownDays }
  );
} catch (error) {
  const code =
    error && typeof error.body === "object" && error.body !== null
      ? error.body.code
      : null;
  const message =
    error && typeof error.body === "object" && error.body !== null
      ? error.body.message
      : "";

  if (code === "P0001" && message === "No candidates available in pool_entries") {
    console.log(
      JSON.stringify(
        {
          ok: true,
          day,
          launch_day: launchDay,
          cooldown_days: cooldownDays,
          selected_user_id: null,
          username: null,
          skipped: "no_candidates_in_pool",
        },
        null,
        2
      )
    );
    process.exit(0);
  }

  const detail =
    typeof error.body === "string"
      ? error.body
      : JSON.stringify(error.body ?? {});
  throw new Error(`pick_daily_chosen failed (${error.status ?? "unknown"}): ${detail}`);
}

const chosenInfo = await callRpc(
  supabaseUrl,
  supabaseSecretKey,
  "get_chosen_for_day",
  { p_day: day }
);

const chosenRow =
  Array.isArray(chosenInfo) && chosenInfo.length > 0 ? chosenInfo[0] : null;

console.log(
  JSON.stringify(
    {
      ok: true,
      day,
      launch_day: launchDay,
      cooldown_days: cooldownDays,
      selected_user_id: selectedUserId,
      username: chosenRow?.username ?? null,
    },
    null,
    2
  )
);

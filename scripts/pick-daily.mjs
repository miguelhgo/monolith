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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error("PICK_DAY must use YYYY-MM-DD format");
  }
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
    const detail =
      typeof parsed === "string" ? parsed : JSON.stringify(parsed ?? {});
    throw new Error(`${fnName} failed (${response.status}): ${detail}`);
  }

  return parsed;
}

const supabaseUrl = readSupabaseUrl();
const supabaseSecretKey = readSupabaseSecretKey();
const cooldownDays = readCooldownDays();
const day = readPickDay();

const selectedUserId = await callRpc(
  supabaseUrl,
  supabaseSecretKey,
  "pick_daily_chosen",
  { p_day: day, p_cooldown_days: cooldownDays }
);

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
      cooldown_days: cooldownDays,
      selected_user_id: selectedUserId,
      username: chosenRow?.username ?? null,
    },
    null,
    2
  )
);

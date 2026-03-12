const ISO_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

function getTodayUtc() {
  return new Date().toISOString().slice(0, 10);
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
    error.status = response.status;
    error.body = parsed;
    throw error;
  }

  return parsed;
}

const supabaseUrl = readSupabaseUrl();
const supabaseSecretKey = readSupabaseSecretKey();
const today = getTodayUtc();

console.log(`Running daily cleanup for content before ${today}...`);

try {
  const result = await callRpc(
    supabaseUrl,
    supabaseSecretKey,
    "cleanup_expired_content",
    { p_before_day: today }
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        before_day: today,
        ...result,
      },
      null,
      2
    )
  );
} catch (error) {
  const detail =
    typeof error.body === "string"
      ? error.body
      : JSON.stringify(error.body ?? {});
  console.error(`Cleanup failed (${error.status ?? "unknown"}): ${detail}`);
  process.exit(1);
}

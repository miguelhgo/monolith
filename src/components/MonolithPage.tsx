import { useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { ArrowRight, Loader2, LogOut, Sparkles } from "lucide-react";
import MonolithMark from "./MonolithMark";
import { hasSupabaseEnv, supabase } from "../lib/supabase";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const DEFAULT_WAITING = 284019;
const DEFAULT_LAUNCH_DATE = "2026-03-31";

function formatCount(value: number | null) {
  if (value === null || Number.isNaN(value)) return "…";
  return value.toLocaleString("en-US");
}

function formatLaunchDate(launchDateIso: string) {
  const date = new Date(`${launchDateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return launchDateIso;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

function usernameValidationMessage(username: string) {
  if (!username) return "Pick a username to continue.";
  if (!USERNAME_REGEX.test(username)) {
    return "Use 3-20 chars: lowercase letters, numbers, and underscores.";
  }
  return null;
}

export default function MonolithPage() {
  const launchDate = useMemo(
    () =>
      formatLaunchDate(
        import.meta.env.PUBLIC_LAUNCH_DATE?.trim() || DEFAULT_LAUNCH_DATE
      ),
    []
  );

  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [waitingCount, setWaitingCount] = useState<number | null>(
    hasSupabaseEnv ? null : DEFAULT_WAITING
  );
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null
  );

  const [profileLoading, setProfileLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [poolLoading, setPoolLoading] = useState(false);
  const [poolPosition, setPoolPosition] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  const refreshWaitingCount = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.rpc("get_waiting_count");
    if (error) {
      setWaitingCount((previous) => previous ?? DEFAULT_WAITING);
      return;
    }

    const parsed = typeof data === "number" ? data : Number(data);
    if (Number.isFinite(parsed)) setWaitingCount(parsed);
  };

  useEffect(() => {
    if (!supabase) return;
    refreshWaitingCount();
    const timer = window.setInterval(refreshWaitingCount, 20000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setAuthError("Couldn't verify auth session.");
      setSession(data.session);
      setAuthReady(true);
    };

    initAuth();

    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
      }
    );

    return () => authSub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setUsername(null);
      setPoolPosition(null);
      setUsernameInput("");
      setProfileLoading(false);
      setPoolLoading(false);
      return;
    }

    let cancelled = false;
    const userId = session.user.id;

    const loadProfile = async () => {
      setProfileLoading(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setAuthError("Couldn't load your profile.");
        setProfileLoading(false);
        return;
      }

      const existingUsername = profile?.username ?? null;
      setUsername(existingUsername);
      setProfileLoading(false);
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session || !username) {
      if (!username) {
        setPoolPosition(null);
        setPoolLoading(false);
      }
      return;
    }

    let cancelled = false;
    const userId = session.user.id;

    const reservePoolPosition = async () => {
      setPoolLoading(true);

      const { error: upsertError } = await supabase
        .from("pool_entries")
        .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });

      if (cancelled) return;
      if (upsertError) {
        setAuthError("Couldn't reserve your pool position.");
        setPoolLoading(false);
        return;
      }

      const { data: entry, error: entryError } = await supabase
        .from("pool_entries")
        .select("position")
        .eq("user_id", userId)
        .single();

      if (cancelled) return;
      if (entryError) {
        setAuthError("Couldn't read your pool position.");
      } else {
        setPoolPosition(entry.position);
      }

      setPoolLoading(false);
      refreshWaitingCount();
    };

    reservePoolPosition();

    return () => {
      cancelled = true;
    };
  }, [session, username]);

  const startOAuth = async (provider: "google" | "github") => {
    if (!supabase) return;
    setAuthError(null);
    setOauthLoading(provider);

    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setAuthError(`Couldn't start ${provider} login.`);
      setOauthLoading(null);
    }
  };

  const saveUsername = async () => {
    if (!supabase || !session) return;
    const normalized = normalizeUsername(usernameInput);
    const validationError = usernameValidationMessage(normalized);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setUsernameSaving(true);
    setUsernameError(null);

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: session.user.id, username: normalized }, { onConflict: "user_id" });

    if (error) {
      if (error.code === "23505") {
        setUsernameError("That username is taken. Try another one.");
      } else {
        setUsernameError("Couldn't save username. Try again.");
      }
      setUsernameSaving(false);
      return;
    }

    setUsername(normalized);
    setUsernameInput("");
    setUsernameSaving(false);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setShowAuthSheet(false);
    setAuthError(null);
    setUsername(null);
    setPoolPosition(null);
  };

  const showUsernameStep = Boolean(session && !username);
  const showReadyState = Boolean(session && username);
  const isBusy = !authReady || profileLoading || poolLoading;

  return (
    <div style={{ minHeight: "100vh", padding: "24px 14px 30px" }}>
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <MonolithMark size={22} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              lineHeight: 1,
              letterSpacing: "-0.55px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            monolith
          </span>
        </header>

        <section
          style={{
            border: "1px solid var(--border-soft)",
            borderRadius: "12px",
            padding: "20px 16px 18px",
            background:
              "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.14), rgba(249,115,22,0) 44%), radial-gradient(circle at 95% 5%, rgba(244,193,93,0.09), rgba(244,193,93,0) 48%), #0f1219",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "999px",
              border: "1px solid rgba(244,193,93,0.36)",
              background: "rgba(244,193,93,0.12)",
              color: "var(--accent-warm)",
              padding: "5px 10px",
              fontFamily: "'DM Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.55px",
              fontSize: "10px",
            }}
          >
            <Sparkles size={11} />
            pre-launch
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(31px, 8vw, 48px)",
              lineHeight: 1.03,
              letterSpacing: "-0.9px",
              margin: "12px 0 8px",
              color: "var(--text-primary)",
            }}
          >
            One chosen voice.
            <br />
            One day.
            <br />
            The world listens.
          </h1>

          <p
            style={{
              margin: "0 0 16px",
              color: "var(--text-secondary)",
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: "20px",
              lineHeight: 1.35,
              maxWidth: "36ch",
            }}
          >
            Join the pool now. We launch on {launchDate}. You will be notified
            when the first monolith drops.
          </p>

          {!session && (
            <button
              onClick={() => setShowAuthSheet(true)}
              disabled={!hasSupabaseEnv}
              style={{
                width: "100%",
                maxWidth: "320px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#f3efe6",
                border: "1px solid rgba(243,239,230,0.76)",
                borderRadius: "10px",
                padding: "11px 14px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: "#0b0d12",
                cursor: hasSupabaseEnv ? "pointer" : "not-allowed",
                opacity: hasSupabaseEnv ? 1 : 0.7,
              }}
            >
              Join the speaker pool
              <ArrowRight size={14} />
            </button>
          )}

          {showUsernameStep && (
            <div
              style={{
                marginTop: "8px",
                maxWidth: "390px",
                border: "1px solid #2d3446",
                borderRadius: "10px",
                padding: "12px",
                background: "rgba(16,20,29,0.7)",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                }}
              >
                Choose your public username
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setUsernameError(null);
                  }}
                  placeholder="cipher_punk"
                  autoComplete="off"
                  style={{
                    flex: "1 1 220px",
                    minWidth: "180px",
                    background: "#0c1018",
                    border: "1px solid #31384b",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    color: "var(--text-primary)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "13px",
                  }}
                />
                <button
                  onClick={saveUsername}
                  disabled={usernameSaving}
                  style={{
                    background: "rgba(244,193,93,0.12)",
                    border: "1px solid rgba(244,193,93,0.28)",
                    borderRadius: "10px",
                    color: "#efdcae",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    minWidth: "104px",
                  }}
                >
                  {usernameSaving ? "Saving..." : "Save handle"}
                </button>
              </div>
              <p
                style={{
                  margin: "8px 0 0",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  color: usernameError ? "#fca5a5" : "var(--text-dim)",
                }}
              >
                {usernameError ||
                  "3-20 chars · lowercase letters, numbers, underscore"}
              </p>
            </div>
          )}

          {showReadyState && (
            <div
              style={{
                marginTop: "8px",
                maxWidth: "520px",
                border: "1px solid rgba(244,193,93,0.25)",
                borderRadius: "10px",
                background: "rgba(244,193,93,0.08)",
                padding: "12px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--text-primary)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "16px",
                  lineHeight: 1.35,
                }}
              >
                You're #{poolPosition ?? "..."} in the pool.
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "var(--text-secondary)",
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: "18px",
                  lineHeight: 1.35,
                }}
              >
                We launch on {launchDate}. You'll get notified when the first
                monolith drops.
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "var(--text-dim)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                }}
              >
                Public handle: @{username}
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #2f3548",
              borderRadius: "8px",
              padding: "7px 10px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{ color: "var(--accent-warm)", fontWeight: 600 }}>
              {formatCount(waitingCount)}
            </span>
            people waiting
            {isBusy && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
          </div>

          {session && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: 0,
                }}
              >
                <LogOut size={12} />
                Sign out
              </button>
            </div>
          )}

          {!hasSupabaseEnv && (
            <p
              style={{
                margin: "12px 0 0",
                color: "#fbbf24",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
              }}
            >
              Configure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to
              enable OAuth.
            </p>
          )}
        </section>
      </main>

      {showAuthSheet && !session && (
        <div
          onClick={() => {
            if (!oauthLoading) setShowAuthSheet(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.68)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "#0f1219",
              border: "1px solid #2f3648",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                color: "var(--text-primary)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Join the speaker pool
            </p>
            <p
              style={{
                margin: "0 0 12px",
                color: "var(--text-secondary)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                lineHeight: 1.35,
              }}
            >
              Sign in with OAuth, then pick your public pseudonymous username.
            </p>

            <div style={{ display: "grid", gap: "8px" }}>
              <button
                onClick={() => startOAuth("google")}
                disabled={oauthLoading !== null}
                style={{
                  border: "1px solid #3a4154",
                  background: "#f3efe6",
                  color: "#0b0d12",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {oauthLoading === "google" ? "Redirecting..." : "Continue with Google"}
              </button>
              <button
                onClick={() => startOAuth("github")}
                disabled={oauthLoading !== null}
                style={{
                  border: "1px solid #31384b",
                  background: "#141924",
                  color: "var(--text-primary)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {oauthLoading === "github" ? "Redirecting..." : "Continue with GitHub"}
              </button>
            </div>

            {authError && (
              <p
                style={{
                  margin: "10px 0 0",
                  color: "#fda4af",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                }}
              >
                {authError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { ArrowRight, Loader2, LogOut, Sparkles } from "lucide-react";
import { hasSupabaseEnv } from "../lib/supabase";
import { formatCount } from "../lib/monolith";

interface Props {
  launchDate: string;
  isAuthenticated: boolean;
  showUsernameStep: boolean;
  usernameInput: string;
  usernameSaving: boolean;
  usernameError: string | null;
  showReadyState: boolean;
  poolPosition: number | null;
  username: string | null;
  waitingCount: number | null;
  isBusy: boolean;
  onOpenAuthSheet: () => void;
  onUsernameInputChange: (value: string) => void;
  onSaveUsername: () => void;
  onSignOut: () => void;
}

export default function PrelaunchSection({
  launchDate,
  isAuthenticated,
  showUsernameStep,
  usernameInput,
  usernameSaving,
  usernameError,
  showReadyState,
  poolPosition,
  username,
  waitingCount,
  isBusy,
  onOpenAuthSheet,
  onUsernameInputChange,
  onSaveUsername,
  onSignOut,
}: Props) {
  return (
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
        Join the pool now. We launch on {launchDate}. You will be notified when
        the first monolith drops.
      </p>

      {!isAuthenticated && (
        <button
          onClick={onOpenAuthSheet}
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
              onChange={(e) => onUsernameInputChange(e.target.value)}
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
              onClick={onSaveUsername}
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
            {usernameError || "3-20 chars · lowercase letters, numbers, underscore"}
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

      {isAuthenticated && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={onSignOut}
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
          Configure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY to
          enable OAuth.
        </p>
      )}
    </section>
  );
}

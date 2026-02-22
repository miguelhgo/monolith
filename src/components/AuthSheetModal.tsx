import type { OAuthProvider } from "../lib/monolith";

interface Props {
  open: boolean;
  oauthLoading: OAuthProvider | null;
  authError: string | null;
  onClose: () => void;
  onStartOAuth: (provider: OAuthProvider) => void;
}

export default function AuthSheetModal({
  open,
  oauthLoading,
  authError,
  onClose,
  onStartOAuth,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={() => {
        if (!oauthLoading) onClose();
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
            onClick={() => onStartOAuth("google")}
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
            onClick={() => onStartOAuth("github")}
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
  );
}

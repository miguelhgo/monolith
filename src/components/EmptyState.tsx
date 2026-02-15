import { Bell, Sparkles, Loader2 } from "lucide-react";
import Countdown from "./Countdown";

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onNotify: () => void;
}

export default function EmptyState({ isLoggedIn, onLoginClick, onNotify }: Props) {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          margin: "0 auto 24px",
          background:
            "linear-gradient(135deg, rgba(232,93,38,0.15), rgba(99,102,241,0.1))",
          border: "1px solid rgba(232,93,38,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          size={28}
          style={{ color: "#e85d26", animation: "spin 3s linear infinite" }}
        />
      </div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 8px",
        }}
      >
        Today's voice hasn't spoken yet
      </h2>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          color: "#4a4a56",
          margin: "0 0 4px",
        }}
      >
        The algorithm has chosen. We're waiting for their words.
      </p>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          color: "#3a3a46",
          margin: "0 0 24px",
        }}
      >
        New monolith window opened at 00:00 UTC
      </p>
      <Countdown size="lg" />
      {isLoggedIn ? (
        <button
          onClick={onNotify}
          style={{
            marginTop: "24px",
            background: "rgba(232,93,38,0.08)",
            border: "1px solid rgba(232,93,38,0.15)",
            borderRadius: "10px",
            padding: "10px 24px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            color: "#e85d26",
          }}
        >
          <Bell size={14} /> Notify me when it drops
        </button>
      ) : (
        <button
          onClick={onLoginClick}
          style={{
            marginTop: "24px",
            background: "linear-gradient(135deg, #e85d26, #d04f1c)",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
          }}
        >
          <Sparkles size={14} /> Join & get notified
        </button>
      )}
    </div>
  );
}

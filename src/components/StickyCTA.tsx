import { Sparkles } from "lucide-react";

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface Props {
  onLoginClick: () => void;
}

export default function StickyCTA({ onLoginClick }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background:
          "linear-gradient(180deg, rgba(8,9,13,0), rgba(8,9,13,0.96) 38%), radial-gradient(circle at 50% 100%, rgba(249,115,22,0.1), rgba(249,115,22,0) 60%)",
        padding: "28px 20px 16px",
        zIndex: 50,
        animation: "slideUp 0.5s ease 0.8s both",
      }}
    >
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <button
          onClick={onLoginClick}
          style={{
            width: "100%",
            padding: "14px",
            background: "#f3efe6",
            border: "1px solid rgba(243,239,230,0.72)",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "#0b0d12",
            transition: "all 0.2s",
            boxShadow: "0 10px 26px rgba(0,0,0,0.34)",
          }}
        >
          <Sparkles size={16} /> Join the lottery &mdash; {formatNum(284019)}{" "}
          waiting
        </button>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#6f788c",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          One chosen voice, every day. Their words disappear in 24 hours.
        </p>
      </div>
    </div>
  );
}

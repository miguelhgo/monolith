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
        background: "linear-gradient(180deg, rgba(8,8,12,0), #08080c 30%)",
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
            background: "linear-gradient(135deg, #e85d26, #d04f1c)",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            transition: "all 0.2s",
            boxShadow: "0 4px 24px rgba(232,93,38,0.3)",
          }}
        >
          <Sparkles size={16} /> Join the lottery &mdash; {formatNum(284019)}{" "}
          waiting
        </button>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#3a3a46",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          One person, chosen at random, every day. Their words disappear in 24
          hours.
        </p>
      </div>
    </div>
  );
}

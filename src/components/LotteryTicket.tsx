import { Ticket } from "lucide-react";

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

interface Props {
  poolPosition: number | null;
  poolTotal: number | null;
  username: string | null;
}

export default function LotteryTicket({ poolPosition, poolTotal, username }: Props) {
  // Only render when user is in the pool
  if (poolPosition === null || poolTotal === null || !username) return null;

  const chance = poolTotal > 0 ? ((1 / poolTotal) * 100).toFixed(4) : "0.0000";

  return (
    <div
      style={{
        margin: "0 0 8px",
        padding: "14px 18px",
        background:
          "linear-gradient(135deg, rgba(232,93,38,0.06), rgba(99,102,241,0.04))",
        border: "1px solid rgba(232,93,38,0.1)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Ticket size={16} style={{ color: "#e85d26" }} />
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              color: "#7a7a8a",
            }}
          >
            Your number
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            #{formatNum(poolPosition)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#4a4a56",
          }}
        >
          {chance}% chance tomorrow
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#3a3a46",
          }}
        >
          {formatNum(poolTotal)} in the pool
        </div>
      </div>
    </div>
  );
}

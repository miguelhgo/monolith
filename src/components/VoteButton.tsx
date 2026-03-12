import { ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  votesUp: number;
  votesDown: number;
  currentUserVote?: number;
  onVote?: (value: 1 | -1) => void;
  size?: "sm" | "lg";
}

function formatVotes(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export default function VoteButton({
  votesUp,
  votesDown,
  currentUserVote = 0,
  onVote,
  size = "sm",
}: Props) {
  const net = votesUp - votesDown;
  const iconSize = size === "lg" ? 15 : 12;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "20px",
        padding: size === "lg" ? "2px 6px" : "1px 4px",
      }}
    >
      <button
        onClick={() => onVote?.(1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 5px",
          display: "flex",
          alignItems: "center",
          color: currentUserVote === 1 ? "#e85d26" : "#4a4a56",
          transition: "color 0.15s",
        }}
      >
        <ChevronUp size={iconSize} strokeWidth={currentUserVote === 1 ? 3 : 2} />
      </button>
      <span
        style={{
          fontFamily: "'DM Mono', 'SF Mono', monospace",
          fontSize: size === "lg" ? "13px" : "12px",
          fontWeight: 600,
          color:
            currentUserVote === 1
              ? "#e85d26"
              : currentUserVote === -1
                ? "#6366f1"
                : "#7a7a8a",
          minWidth: size === "lg" ? "40px" : "28px",
          textAlign: "center",
        }}
      >
        {formatVotes(net)}
      </span>
      <button
        onClick={() => onVote?.(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 5px",
          display: "flex",
          alignItems: "center",
          color: currentUserVote === -1 ? "#6366f1" : "#4a4a56",
          transition: "color 0.15s",
        }}
      >
        <ChevronDown size={iconSize} strokeWidth={currentUserVote === -1 ? 3 : 2} />
      </button>
    </div>
  );
}

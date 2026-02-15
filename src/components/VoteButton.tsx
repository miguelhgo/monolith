import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  votes: number;
  size?: "sm" | "lg";
}

function formatVotes(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export default function VoteButton({ votes: initialVotes, size = "sm" }: Props) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(0);
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
        onClick={() => {
          if (voted === 1) {
            setVoted(0);
            setVotes(initialVotes);
          } else {
            setVoted(1);
            setVotes(initialVotes + 1);
          }
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 5px",
          display: "flex",
          alignItems: "center",
          color: voted === 1 ? "#e85d26" : "#4a4a56",
          transition: "color 0.15s",
        }}
      >
        <ChevronUp size={iconSize} strokeWidth={voted === 1 ? 3 : 2} />
      </button>
      <span
        style={{
          fontFamily: "'DM Mono', 'SF Mono', monospace",
          fontSize: size === "lg" ? "13px" : "12px",
          fontWeight: 600,
          color: voted === 1 ? "#e85d26" : voted === -1 ? "#6366f1" : "#7a7a8a",
          minWidth: size === "lg" ? "40px" : "28px",
          textAlign: "center",
        }}
      >
        {formatVotes(votes)}
      </span>
      <button
        onClick={() => {
          if (voted === -1) {
            setVoted(0);
            setVotes(initialVotes);
          } else {
            setVoted(-1);
            setVotes(initialVotes - 1);
          }
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 5px",
          display: "flex",
          alignItems: "center",
          color: voted === -1 ? "#6366f1" : "#4a4a56",
          transition: "color 0.15s",
        }}
      >
        <ChevronDown size={iconSize} strokeWidth={voted === -1 ? 3 : 2} />
      </button>
    </div>
  );
}

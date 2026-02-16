import { useState } from "react";
import { LogIn } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export default function CommentInput({ isLoggedIn, onLoginClick }: Props) {
  const [commentInput, setCommentInput] = useState("");

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "16px 0" }}>
        <button
          onClick={onLoginClick}
          style={{
            width: "100%",
            background: "#0c0c12",
            border: "1px solid #16161e",
            borderRadius: "10px",
            padding: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            color: "#4a4a56",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a34")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#16161e")}
        >
          <LogIn size={14} /> Sign in to respond
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          background: "#0c0c12",
          border: "1px solid #16161e",
          borderRadius: "10px",
          padding: "14px 16px",
        }}
      >
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Your response to the monolith..."
          rows={2}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#c0c0cc",
            fontSize: "14.5px",
            resize: "none",
            fontFamily: "'Newsreader', Georgia, serif",
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              color: "#2a2a34",
            }}
          >
            {commentInput.length}/2000
          </span>
          <button
            style={{
              background: commentInput.length > 0 ? "#e85d26" : "transparent",
              border:
                commentInput.length > 0
                  ? "1px solid #e85d26"
                  : "1px solid #1a1a24",
              borderRadius: "10px",
              padding: "6px 20px",
              color: commentInput.length > 0 ? "#fff" : "#3a3a46",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            post
          </button>
        </div>
      </div>
    </div>
  );
}

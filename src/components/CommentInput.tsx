import { useState } from "react";
import { LogIn, X } from "lucide-react";

interface Props {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSubmit: (body: string) => Promise<boolean | undefined>;
  placeholder?: string;
  isReply?: boolean;
  onCancel?: () => void;
}

export default function CommentInput({
  isLoggedIn,
  onLoginClick,
  onSubmit,
  placeholder,
  isReply = false,
  onCancel,
}: Props) {
  const [commentInput, setCommentInput] = useState("");
  const [posting, setPosting] = useState(false);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: isReply ? "8px 0" : "16px 0" }}>
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

  const handleSubmit = async () => {
    const body = commentInput.trim();
    if (!body || posting) return;

    setPosting(true);
    const ok = await onSubmit(body);
    setPosting(false);

    if (ok) {
      setCommentInput("");
      onCancel?.();
    }
  };

  return (
    <div style={{ padding: isReply ? "8px 0" : "16px 0" }}>
      <div
        style={{
          background: "#0c0c12",
          border: "1px solid #16161e",
          borderRadius: "10px",
          padding: isReply ? "10px 12px" : "14px 16px",
        }}
      >
        <textarea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder={
            placeholder ?? (isReply ? "Write a reply..." : "Your response to the monolith...")
          }
          rows={isReply ? 1 : 2}
          maxLength={2000}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#c0c0cc",
            fontSize: isReply ? "13px" : "14.5px",
            resize: "none",
            fontFamily: "'Newsreader', Georgia, serif",
            lineHeight: 1.6,
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
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
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {isReply && onCancel && (
              <button
                onClick={onCancel}
                style={{
                  background: "transparent",
                  border: "1px solid #1a1a24",
                  borderRadius: "10px",
                  padding: "6px 12px",
                  color: "#3a3a46",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <X size={11} /> cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={commentInput.trim().length === 0 || posting}
              style={{
                background:
                  commentInput.trim().length > 0 ? "#e85d26" : "transparent",
                border:
                  commentInput.trim().length > 0
                    ? "1px solid #e85d26"
                    : "1px solid #1a1a24",
                borderRadius: "10px",
                padding: "6px 20px",
                color: commentInput.trim().length > 0 ? "#fff" : "#3a3a46",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                fontWeight: 500,
                cursor:
                  commentInput.trim().length > 0 && !posting
                    ? "pointer"
                    : "not-allowed",
                transition: "all 0.2s",
                opacity: posting ? 0.6 : 1,
              }}
            >
              {posting ? "posting..." : "post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

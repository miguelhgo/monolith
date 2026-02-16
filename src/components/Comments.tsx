import { useState } from "react";
import { ChevronRight, CornerDownRight, Plus } from "lucide-react";
import VoteButton from "./VoteButton";

interface CommentData {
  id: number;
  user: string;
  time: string;
  votes: number;
  text: string;
  replies: CommentData[];
}

interface CommentsProps {
  comments: CommentData[];
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const HASH_COLORS = [
  "#e85d26", "#6366f1", "#10b981", "#f59e0b", "#ec4899",
  "#14b8a6", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return HASH_COLORS[Math.abs(h) % HASH_COLORS.length];
}

const MAX_DEPTH = 3;
const COMMENT_TRUNCATE = 200;

function countReplies(comment: CommentData): number {
  let count = comment.replies.length;
  for (const r of comment.replies) count += countReplies(r);
  return count;
}

function Comment({
  comment,
  depth = 0,
  isLoggedIn,
  onLoginClick,
}: {
  comment: CommentData;
  depth?: number;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const threadColors = ["#e85d26", "#6366f1", "#10b981", "#f59e0b", "#ec4899"];
  const userColor = hashColor(comment.user);
  const isTruncated = comment.text.length > COMMENT_TRUNCATE && !showFull;
  const displayText = isTruncated
    ? comment.text.slice(0, COMMENT_TRUNCATE).trim() + "\u2026"
    : comment.text;
  const atMaxDepth = depth >= MAX_DEPTH;
  const hasDeepReplies = comment.replies.length > 0 && atMaxDepth;
  const totalNested = countReplies(comment);

  return (
    <div style={{ marginTop: depth === 0 ? "14px" : "6px" }}>
      <div style={{ display: "flex" }}>
        {depth > 0 && (
          <div style={{ display: "flex", flexShrink: 0 }}>
            {Array.from({ length: depth }, (_, i) => (
              <div
                key={i}
                onClick={() => i === depth - 1 && setCollapsed(!collapsed)}
                style={{
                  width: "20px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: i === depth - 1 ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    width: "2px",
                    borderRadius: "1px",
                    transition: "background 0.2s",
                    background:
                      i === depth - 1
                        ? threadColors[i % threadColors.length] + "35"
                        : threadColors[i % threadColors.length] + "15",
                  }}
                />
              </div>
            ))}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, paddingLeft: depth > 0 ? "8px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${userColor}, ${userColor}88)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {comment.user[0].toUpperCase()}
            </div>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: userColor,
              }}
            >
              {comment.user}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#3a3a46",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {comment.time}
            </span>
            {comment.replies.length > 0 && collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                style={{
                  background: `${threadColors[depth % threadColors.length]}12`,
                  border: `1px solid ${threadColors[depth % threadColors.length]}25`,
                  borderRadius: "10px",
                  color: threadColors[depth % threadColors.length],
                  fontSize: "10px",
                  cursor: "pointer",
                  padding: "1px 10px",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Plus size={10} />
                {totalNested}
              </button>
            )}
          </div>
          {!collapsed && (
            <>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "#b0b0be",
                  fontFamily: "'Newsreader', Georgia, serif",
                }}
              >
                {displayText}
                {isTruncated && (
                  <button
                    onClick={() => setShowFull(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#e85d26",
                      cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "11px",
                      marginLeft: "4px",
                      padding: 0,
                    }}
                  >
                    read more
                  </button>
                )}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "5px",
                }}
              >
                <VoteButton votes={comment.votes} />
                <button
                  onClick={() => !isLoggedIn && onLoginClick()}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3a3a46",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    padding: "4px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#7a7a8a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a46")}
                >
                  <CornerDownRight size={11} /> reply
                </button>
              </div>

              {!atMaxDepth &&
                comment.replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    isLoggedIn={isLoggedIn}
                    onLoginClick={onLoginClick}
                  />
                ))}
              {hasDeepReplies && (
                <button
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.12)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    color: "#6366f1",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(99,102,241,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(99,102,241,0.06)")
                  }
                >
                  Continue this thread <ChevronRight size={13} />
                  <span style={{ color: "#4a4a56", fontWeight: 400 }}>
                    ({totalNested} more {totalNested === 1 ? "reply" : "replies"})
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ comments, isLoggedIn, onLoginClick }: CommentsProps) {
  const [activeTab, setActiveTab] = useState("top");

  return (
    <div>
      {/* Sort tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px 0 8px" }}>
        {["top", "new", "controversial"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "rgba(232,93,38,0.08)" : "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              padding: "5px 12px",
              transition: "all 0.2s",
              color: activeTab === tab ? "#e85d26" : "#3a3a46",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = "#7a7a8a";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = "#3a3a46";
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div style={{ padding: "4px 0 40px" }}>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            isLoggedIn={isLoggedIn}
            onLoginClick={onLoginClick}
          />
        ))}
      </div>
    </div>
  );
}

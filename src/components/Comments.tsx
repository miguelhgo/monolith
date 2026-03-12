import { useState } from "react";
import { ChevronRight, CornerDownRight, Plus, Trash2, Loader2 } from "lucide-react";
import VoteButton from "./VoteButton";
import CommentInput from "./CommentInput";
import type { CommentNode } from "../hooks/useComments";

interface CommentsProps {
  comments: CommentNode[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  onLoginClick: () => void;
  onSubmitComment: (body: string, parentId: number | null) => Promise<boolean | undefined>;
  onDeleteComment: (commentId: number) => Promise<boolean | undefined>;
  onVote: (targetType: string, targetId: number, value: 1 | -1) => void;
  getUserVote: (targetType: string, targetId: number) => number;
  loading?: boolean;
  submitting?: boolean;
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

function countReplies(comment: CommentNode): number {
  let count = comment.replies.length;
  for (const r of comment.replies) count += countReplies(r);
  return count;
}

function formatTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Comment({
  comment,
  depth = 0,
  isLoggedIn,
  currentUserId,
  onLoginClick,
  onSubmitComment,
  onDeleteComment,
  onVote,
  getUserVote,
}: {
  comment: CommentNode;
  depth?: number;
  isLoggedIn: boolean;
  currentUserId: string | null;
  onLoginClick: () => void;
  onSubmitComment: (body: string, parentId: number | null) => Promise<boolean | undefined>;
  onDeleteComment: (commentId: number) => Promise<boolean | undefined>;
  onVote: (targetType: string, targetId: number, value: 1 | -1) => void;
  getUserVote: (targetType: string, targetId: number) => number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const threadColors = ["#e85d26", "#6366f1", "#10b981", "#f59e0b", "#ec4899"];
  const userColor = hashColor(comment.username);
  const isTruncated = comment.body.length > COMMENT_TRUNCATE && !showFull;
  const displayText = isTruncated
    ? comment.body.slice(0, COMMENT_TRUNCATE).trim() + "\u2026"
    : comment.body;
  const atMaxDepth = depth >= MAX_DEPTH;
  const hasDeepReplies = comment.replies.length > 0 && atMaxDepth;
  const totalNested = countReplies(comment);
  const isOwn = currentUserId !== null && comment.user_id === currentUserId;
  const currentVote = getUserVote("comment", comment.id);

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
              {comment.username[0].toUpperCase()}
            </div>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                fontWeight: 600,
                color: userColor,
              }}
            >
              {comment.username}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#3a3a46",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {formatTimeAgo(comment.created_at)}
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
                <VoteButton
                  votesUp={comment.votes_up}
                  votesDown={comment.votes_down}
                  currentUserVote={currentVote}
                  onVote={(value) => onVote("comment", comment.id, value)}
                />
                {!atMaxDepth && (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onLoginClick();
                      } else {
                        setShowReplyInput(!showReplyInput);
                      }
                    }}
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
                )}
                {isOwn && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
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
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a46")}
                  >
                    <Trash2 size={11} /> delete
                  </button>
                )}
              </div>

              {showReplyInput && (
                <CommentInput
                  isLoggedIn={isLoggedIn}
                  onLoginClick={onLoginClick}
                  onSubmit={(body) => onSubmitComment(body, comment.id)}
                  isReply
                  placeholder={`Reply to ${comment.username}...`}
                  onCancel={() => setShowReplyInput(false)}
                />
              )}

              {!atMaxDepth &&
                comment.replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    isLoggedIn={isLoggedIn}
                    currentUserId={currentUserId}
                    onLoginClick={onLoginClick}
                    onSubmitComment={onSubmitComment}
                    onDeleteComment={onDeleteComment}
                    onVote={onVote}
                    getUserVote={getUserVote}
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

export default function Comments({
  comments,
  isLoggedIn,
  currentUserId,
  onLoginClick,
  onSubmitComment,
  onDeleteComment,
  onVote,
  getUserVote,
  loading,
  submitting,
}: CommentsProps) {
  const [activeTab, setActiveTab] = useState("new");

  const sortedComments = [...comments].sort((a, b) => {
    if (activeTab === "top") {
      const aNet = a.votes_up - a.votes_down;
      const bNet = b.votes_up - b.votes_down;
      return bNet - aNet;
    }
    if (activeTab === "controversial") {
      const aTotal = a.votes_up + a.votes_down;
      const bTotal = b.votes_up + b.votes_down;
      return bTotal - aTotal;
    }
    // "new" — newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      {/* Comment input */}
      <CommentInput
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        onSubmit={(body) => onSubmitComment(body, null)}
      />

      {/* Sort tabs + comment count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 0 8px",
        }}
      >
        {["new", "top", "controversial"].map((tab) => (
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
        {loading && (
          <Loader2
            size={12}
            style={{ animation: "spin 1s linear infinite", color: "#3a3a46", marginLeft: "4px" }}
          />
        )}
        {submitting && (
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              color: "#e85d26",
              marginLeft: "4px",
            }}
          >
            posting...
          </span>
        )}
      </div>

      {/* Comments list */}
      <div style={{ padding: "4px 0 40px" }}>
        {sortedComments.length === 0 && !loading && (
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
              color: "#3a3a46",
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No comments yet. Be the first to respond.
          </p>
        )}
        {sortedComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
            onLoginClick={onLoginClick}
            onSubmitComment={onSubmitComment}
            onDeleteComment={onDeleteComment}
            onVote={onVote}
            getUserVote={getUserVote}
          />
        ))}
      </div>
    </div>
  );
}

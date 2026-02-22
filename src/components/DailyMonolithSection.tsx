import { Loader2 } from "lucide-react";
import {
  BODY_MIN,
  TITLE_MIN,
  type ChosenInfo,
  type DailyPost,
} from "../lib/monolith";

interface Props {
  dayLabel: string;
  chosenLoading: boolean;
  postLoading: boolean;
  chosenError: string | null;
  postError: string | null;
  chosenInfo: ChosenInfo | null;
  dailyPost: DailyPost | null;
  postUpdatedUtc: string | null;
  isCurrentUserChosen: boolean;
  username: string | null;
  draftTitle: string;
  draftBody: string;
  postSaving: boolean;
  postSaveError: string | null;
  postSaveSuccess: string | null;
  canSubmit: boolean;
  onDraftTitleChange: (value: string) => void;
  onDraftBodyChange: (value: string) => void;
  onSubmit: () => void;
}

export default function DailyMonolithSection({
  dayLabel,
  chosenLoading,
  postLoading,
  chosenError,
  postError,
  chosenInfo,
  dailyPost,
  postUpdatedUtc,
  isCurrentUserChosen,
  username,
  draftTitle,
  draftBody,
  postSaving,
  postSaveError,
  postSaveSuccess,
  canSubmit,
  onDraftTitleChange,
  onDraftBodyChange,
  onSubmit,
}: Props) {
  return (
    <section
      style={{
        marginTop: "14px",
        border: "1px solid var(--border-soft)",
        borderRadius: "12px",
        padding: "20px 16px 18px",
        background: "#0f1219",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontFamily: "'DM Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          fontSize: "10px",
          color: "var(--accent-warm)",
        }}
      >
        Monolith day · {dayLabel} (UTC)
      </p>
      <h2
        style={{
          margin: "0 0 10px",
          color: "var(--text-primary)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "26px",
          lineHeight: 1.1,
          letterSpacing: "-0.4px",
        }}
      >
        Today's monolith
      </h2>

      {(chosenLoading || postLoading) && (
        <p
          style={{
            margin: "0 0 10px",
            color: "var(--text-secondary)",
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
          Loading daily snapshot...
        </p>
      )}

      {chosenError && (
        <p
          style={{
            margin: "0 0 10px",
            color: "#fda4af",
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
          }}
        >
          {chosenError}
        </p>
      )}

      {postError && (
        <p
          style={{
            margin: "0 0 10px",
            color: "#fda4af",
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
          }}
        >
          {postError}
        </p>
      )}

      {!dailyPost && chosenInfo && (
        <p
          style={{
            margin: "0 0 14px",
            color: "var(--text-secondary)",
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: "20px",
            lineHeight: 1.35,
            maxWidth: "40ch",
          }}
        >
          @{chosenInfo.username ?? "chosen_voice"} has been selected for today.
          We're waiting for their monolith.
        </p>
      )}

      {!dailyPost && !chosenInfo && (
        <p
          style={{
            margin: "0 0 14px",
            color: "var(--text-secondary)",
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: "20px",
            lineHeight: 1.35,
            maxWidth: "40ch",
          }}
        >
          Today's chosen voice has not been assigned yet.
        </p>
      )}

      {dailyPost && (
        <article
          style={{
            border: "1px solid #273047",
            borderRadius: "12px",
            background: "rgba(16,20,29,0.6)",
            padding: "14px 14px 12px",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "var(--text-dim)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
            }}
          >
            Voice: @{chosenInfo?.username ?? "unknown"}
            {postUpdatedUtc ? ` · updated ${postUpdatedUtc} UTC` : ""}
          </p>
          <h3
            style={{
              margin: "0 0 8px",
              color: "var(--text-primary)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "24px",
              lineHeight: 1.15,
              letterSpacing: "-0.3px",
            }}
          >
            {dailyPost.title}
          </h3>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: "21px",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
            }}
          >
            {dailyPost.body}
          </p>
        </article>
      )}

      {isCurrentUserChosen && username && (
        <div
          style={{
            border: "1px solid rgba(244,193,93,0.28)",
            borderRadius: "12px",
            background: "rgba(244,193,93,0.07)",
            padding: "12px",
            marginTop: "12px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "var(--text-primary)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "17px",
              lineHeight: 1.2,
            }}
          >
            You are today's chosen voice, @{username}.
          </p>
          <p
            style={{
              margin: "0 0 10px",
              color: "var(--text-secondary)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
            }}
          >
            Publish before 23:59 UTC. You can update your post for this UTC day.
          </p>

          <div style={{ display: "grid", gap: "8px" }}>
            <input
              value={draftTitle}
              onChange={(e) => onDraftTitleChange(e.target.value)}
              placeholder="Title (16-140 chars)"
              maxLength={140}
              style={{
                width: "100%",
                background: "#0c1018",
                border: "1px solid #31384b",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "16px",
              }}
            />
            <textarea
              value={draftBody}
              onChange={(e) => onDraftBodyChange(e.target.value)}
              placeholder="Write today's monolith (280-12000 chars)"
              rows={8}
              maxLength={12000}
              style={{
                width: "100%",
                background: "#0c1018",
                border: "1px solid #31384b",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: "19px",
                lineHeight: 1.45,
                resize: "vertical",
              }}
            />
          </div>

          <p
            style={{
              margin: "8px 0 0",
              color: "var(--text-dim)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
            }}
          >
            Title {draftTitle.trim().length}/{TITLE_MIN} min · Body{" "}
            {draftBody.trim().length}/{BODY_MIN} min
          </p>

          {postSaveError && (
            <p
              style={{
                margin: "8px 0 0",
                color: "#fda4af",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
              }}
            >
              {postSaveError}
            </p>
          )}

          {postSaveSuccess && (
            <p
              style={{
                margin: "8px 0 0",
                color: "#86efac",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
              }}
            >
              {postSaveSuccess}
            </p>
          )}

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              marginTop: "10px",
              border: "1px solid #3a4154",
              background: "#f3efe6",
              color: "#0b0d12",
              borderRadius: "10px",
              padding: "10px 12px",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.72,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              minWidth: "160px",
            }}
          >
            {postSaving
              ? "Publishing..."
              : dailyPost
                ? "Update today's post"
                : "Publish today's post"}
          </button>
        </div>
      )}
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import MonolithMark from "./MonolithMark";
import PrelaunchSection from "./PrelaunchSection";
import DailyMonolithSection from "./DailyMonolithSection";
import StickyCTA from "./StickyCTA";
import LotteryTicket from "./LotteryTicket";
import AuthSheetModal from "./AuthSheetModal";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import {
  DEFAULT_LAUNCH_DATE,
  formatLaunchDate,
  getUtcDayIso,
  isLaunchLive,
  normalizeLaunchDate,
} from "../lib/monolith";
import { useMonolithAuthPool } from "../hooks/useMonolithAuthPool";
import { useDailyMonolith } from "../hooks/useDailyMonolith";
import { useComments } from "../hooks/useComments";
import { useVotes } from "../hooks/useVotes";

export default function MonolithPage() {
  const launchDateIso = useMemo(
    () => normalizeLaunchDate(import.meta.env.PUBLIC_LAUNCH_DATE || DEFAULT_LAUNCH_DATE),
    []
  );
  const launchDate = useMemo(
    () => formatLaunchDate(launchDateIso),
    [launchDateIso]
  );

  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [currentUtcDayIso, setCurrentUtcDayIso] = useState(() => getUtcDayIso());
  const hasLaunched = isLaunchLive(launchDateIso, currentUtcDayIso);

  const auth = useMonolithAuthPool();
  const daily = useDailyMonolith({
    sessionUserId: auth.session?.user.id,
    enabled: hasLaunched,
  });

  const isLoggedIn = Boolean(auth.session);
  const currentUserId = auth.session?.user.id ?? null;
  const postDay = daily.dailyPost?.day ?? null;

  const commentsHook = useComments({
    day: postDay,
    enabled: hasLaunched && postDay !== null,
  });

  const votesHook = useVotes({
    day: postDay,
    isAuthenticated: isLoggedIn,
  });

  // Derive post id and vote counts from daily post data
  // We need to fetch the post id. The dailyPost from useDailyMonolith doesn't include id.
  // Let's get it from the monolith_posts query. We'll add a small state for it.
  const [postMeta, setPostMeta] = useState<{
    id: number;
    votes_up: number;
    votes_down: number;
  } | null>(null);

  useEffect(() => {
    if (!daily.dailyPost?.day) {
      setPostMeta(null);
      return;
    }

    const fetchPostMeta = async () => {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("monolith_posts")
        .select("id, votes_up, votes_down")
        .eq("day", daily.dailyPost!.day)
        .maybeSingle();

      if (!error && data) {
        setPostMeta({
          id: Number(data.id),
          votes_up: Number(data.votes_up ?? 0),
          votes_down: Number(data.votes_down ?? 0),
        });
      }
    };

    fetchPostMeta();

    // Refresh post meta periodically
    const timer = window.setInterval(fetchPostMeta, 15000);
    return () => window.clearInterval(timer);
  }, [daily.dailyPost?.day, daily.dailyPost?.updated_at]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentUtcDayIso((previous) => {
        const next = getUtcDayIso();
        return previous === next ? previous : next;
      });
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (auth.session) {
      setShowAuthSheet(false);
    }
  }, [auth.session]);

  const openAuthSheet = () => {
    if (!hasSupabaseEnv) return;
    auth.clearAuthError();
    setShowAuthSheet(true);
  };

  const closeAuthSheet = () => {
    setShowAuthSheet(false);
  };

  const signOut = async () => {
    await auth.signOut();
    setShowAuthSheet(false);
  };

  // Vote handler that calls the hook and refreshes post meta + comments
  const handleVote = useCallback(
    async (targetType: string, targetId: number, value: 1 | -1) => {
      if (!isLoggedIn) {
        openAuthSheet();
        return;
      }
      await votesHook.castVote(targetType, targetId, value);
      // Refresh post meta and comments to get updated vote counts
      if (targetType === "post" && daily.dailyPost?.day && supabase) {
        const { data } = await supabase
          .from("monolith_posts")
          .select("id, votes_up, votes_down")
          .eq("day", daily.dailyPost.day)
          .maybeSingle();
        if (data) {
          setPostMeta({
            id: Number(data.id),
            votes_up: Number(data.votes_up ?? 0),
            votes_down: Number(data.votes_down ?? 0),
          });
        }
      }
      if (targetType === "comment") {
        commentsHook.refresh();
      }
    },
    [isLoggedIn, votesHook, daily.dailyPost?.day, commentsHook]
  );

  return (
    <div style={{ minHeight: "100vh", padding: "24px 14px 30px" }}>
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <MonolithMark size={22} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              lineHeight: 1,
              letterSpacing: "-0.55px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            monolith
          </span>
        </header>

        {/* Lottery ticket — only for authenticated users in the pool */}
        {isLoggedIn && auth.poolPosition !== null && (
          <LotteryTicket
            poolPosition={auth.poolPosition}
            poolTotal={auth.waitingCount}
            username={auth.username}
          />
        )}

        <PrelaunchSection
          launchDate={launchDate}
          isAuthenticated={isLoggedIn}
          showUsernameStep={auth.showUsernameStep}
          usernameInput={auth.usernameInput}
          usernameSaving={auth.usernameSaving}
          usernameError={auth.usernameError}
          showReadyState={auth.showReadyState}
          poolPosition={auth.poolPosition}
          username={auth.username}
          waitingCount={auth.waitingCount}
          isBusy={auth.isBusy}
          onOpenAuthSheet={openAuthSheet}
          onUsernameInputChange={auth.setUsernameInput}
          onSaveUsername={auth.saveUsername}
          onSignOut={signOut}
        />

        <DailyMonolithSection
          hasLaunched={hasLaunched}
          launchDate={launchDate}
          dayLabel={daily.dayLabel}
          chosenLoading={daily.chosenLoading}
          postLoading={daily.postLoading}
          chosenError={daily.chosenError}
          postError={daily.postError}
          chosenInfo={daily.chosenInfo}
          dailyPost={daily.dailyPost}
          postUpdatedUtc={daily.postUpdatedUtc}
          isCurrentUserChosen={daily.isCurrentUserChosen}
          username={auth.username}
          draftTitle={daily.draftTitle}
          draftBody={daily.draftBody}
          postSaving={daily.postSaving}
          postSaveError={daily.postSaveError}
          postSaveSuccess={daily.postSaveSuccess}
          canSubmit={daily.canSubmit}
          onDraftTitleChange={daily.onDraftTitleChange}
          onDraftBodyChange={daily.onDraftBodyChange}
          onSubmit={daily.submitDailyPost}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          onLoginClick={openAuthSheet}
          comments={commentsHook.comments}
          commentsLoading={commentsHook.loading}
          commentsSubmitting={commentsHook.submitting}
          onSubmitComment={commentsHook.submitComment}
          onDeleteComment={commentsHook.deleteComment}
          onVote={handleVote}
          getUserVote={votesHook.getUserVote}
          postId={postMeta?.id ?? null}
          postVotesUp={postMeta?.votes_up ?? 0}
          postVotesDown={postMeta?.votes_down ?? 0}
        />
      </main>

      {/* Sticky CTA — only for unauthenticated */}
      {hasLaunched && (
        <StickyCTA
          onLoginClick={openAuthSheet}
          waitingCount={auth.waitingCount}
          isAuthenticated={isLoggedIn}
        />
      )}

      <AuthSheetModal
        open={showAuthSheet && !auth.session}
        oauthLoading={auth.oauthLoading}
        authError={auth.authError}
        onClose={closeAuthSheet}
        onStartOAuth={auth.startOAuth}
      />
    </div>
  );
}

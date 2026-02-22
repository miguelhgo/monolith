import { useEffect, useMemo, useState } from "react";
import MonolithMark from "./MonolithMark";
import PrelaunchSection from "./PrelaunchSection";
import DailyMonolithSection from "./DailyMonolithSection";
import AuthSheetModal from "./AuthSheetModal";
import { hasSupabaseEnv } from "../lib/supabase";
import {
  DEFAULT_LAUNCH_DATE,
  formatLaunchDate,
  getUtcDayIso,
  isLaunchLive,
  normalizeLaunchDate,
} from "../lib/monolith";
import { useMonolithAuthPool } from "../hooks/useMonolithAuthPool";
import { useDailyMonolith } from "../hooks/useDailyMonolith";

export default function MonolithPage() {
  const launchDateIso = useMemo(
    () => normalizeLaunchDate(import.meta.env.PUBLIC_LAUNCH_DATE || DEFAULT_LAUNCH_DATE),
    []
  );
  const launchDate = useMemo(
    () => formatLaunchDate(launchDateIso),
    [launchDateIso]
  );

  const [loaded, setLoaded] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [currentUtcDayIso, setCurrentUtcDayIso] = useState(() => getUtcDayIso());
  const hasLaunched = isLaunchLive(launchDateIso, currentUtcDayIso);

  const auth = useMonolithAuthPool();
  const daily = useDailyMonolith({
    sessionUserId: auth.session?.user.id,
    enabled: hasLaunched,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

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

  return (
    <div style={{ minHeight: "100vh", padding: "24px 14px 30px" }}>
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
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

        <PrelaunchSection
          launchDate={launchDate}
          isAuthenticated={Boolean(auth.session)}
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
        />
      </main>

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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  BODY_MIN,
  TITLE_MIN,
  formatUtcDay,
  formatUtcTimestamp,
  getUtcDayIso,
  type ChosenInfo,
  type DailyPost,
} from "../lib/monolith";

interface UseDailyMonolithArgs {
  sessionUserId?: string | null;
}

export function useDailyMonolith({ sessionUserId }: UseDailyMonolithArgs) {
  const [clientUtcDayIso, setClientUtcDayIso] = useState(() => getUtcDayIso());
  const [chosenInfo, setChosenInfo] = useState<ChosenInfo | null>(null);
  const [chosenLoading, setChosenLoading] = useState(Boolean(supabase));
  const [chosenError, setChosenError] = useState<string | null>(null);

  const [dailyPost, setDailyPost] = useState<DailyPost | null>(null);
  const [postLoading, setPostLoading] = useState(Boolean(supabase));
  const [postError, setPostError] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [postSaving, setPostSaving] = useState(false);
  const [postSaveError, setPostSaveError] = useState<string | null>(null);
  const [postSaveSuccess, setPostSaveSuccess] = useState<string | null>(null);
  const [composerSeedVersion, setComposerSeedVersion] = useState<string | null>(
    null
  );

  const snapshotRequestId = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClientUtcDayIso((previous) => {
        const next = getUtcDayIso();
        return previous === next ? previous : next;
      });
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      snapshotRequestId.current += 1;
    };
  }, []);

  useEffect(() => {
    setDraftTitle("");
    setDraftBody("");
    setPostSaveError(null);
    setPostSaveSuccess(null);
    setComposerSeedVersion(null);
  }, [chosenInfo?.day, sessionUserId]);

  const refreshDailySnapshot = useCallback(async () => {
    if (!supabase) return;

    const requestId = snapshotRequestId.current + 1;
    snapshotRequestId.current = requestId;

    setChosenLoading(true);
    setPostLoading(true);
    setChosenError(null);
    setPostError(null);

    try {
      const chosenResponse = await supabase.rpc("get_chosen_for_day", {});

      if (!isMountedRef.current || requestId !== snapshotRequestId.current) return;

      if (chosenResponse.error) {
        setChosenInfo(null);
        setDailyPost(null);
        setChosenError("Couldn't load today's chosen voice.");
        return;
      }

      const chosenRow = Array.isArray(chosenResponse.data)
        ? chosenResponse.data[0]
        : chosenResponse.data;

      setChosenInfo(chosenRow ?? null);

      if (!chosenRow?.day) {
        setDailyPost(null);
        return;
      }

      const postResponse = await supabase
        .from("monolith_posts")
        .select("day, author_user_id, title, body, updated_at")
        .eq("day", chosenRow.day)
        .maybeSingle();

      if (!isMountedRef.current || requestId !== snapshotRequestId.current) return;

      if (postResponse.error) {
        setDailyPost(null);
        setPostError("Couldn't load today's monolith.");
      } else {
        setDailyPost(postResponse.data ?? null);
      }
    } catch {
      if (!isMountedRef.current || requestId !== snapshotRequestId.current) return;
      setChosenInfo(null);
      setDailyPost(null);
      setChosenError("Couldn't load today's chosen voice.");
      setPostError("Couldn't load today's monolith.");
    } finally {
      if (!isMountedRef.current || requestId !== snapshotRequestId.current) return;
      setChosenLoading(false);
      setPostLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setChosenLoading(false);
      setPostLoading(false);
      return;
    }

    refreshDailySnapshot();
    const timer = window.setInterval(refreshDailySnapshot, 30000);
    return () => window.clearInterval(timer);
  }, [refreshDailySnapshot, sessionUserId]);

  const isCurrentUserChosen = Boolean(
    sessionUserId && chosenInfo?.user_id && sessionUserId === chosenInfo.user_id
  );

  useEffect(() => {
    if (!isCurrentUserChosen || !dailyPost) return;
    const version = `${dailyPost.day}:${dailyPost.updated_at ?? "initial"}`;
    if (composerSeedVersion === version) return;
    setDraftTitle(dailyPost.title);
    setDraftBody(dailyPost.body);
    setComposerSeedVersion(version);
  }, [isCurrentUserChosen, dailyPost, composerSeedVersion]);

  const onDraftTitleChange = useCallback((value: string) => {
    setDraftTitle(value);
    setPostSaveError(null);
    setPostSaveSuccess(null);
  }, []);

  const onDraftBodyChange = useCallback((value: string) => {
    setDraftBody(value);
    setPostSaveError(null);
    setPostSaveSuccess(null);
  }, []);

  const submitDailyPost = useCallback(async () => {
    if (!supabase || !sessionUserId || !isCurrentUserChosen) return;

    const title = draftTitle.trim();
    const body = draftBody.trim();

    if (title.length < TITLE_MIN) {
      setPostSaveError(`Title must be at least ${TITLE_MIN} characters.`);
      return;
    }

    if (body.length < BODY_MIN) {
      setPostSaveError(`Body must be at least ${BODY_MIN} characters.`);
      return;
    }

    setPostSaving(true);
    setPostSaveError(null);
    setPostSaveSuccess(null);

    try {
      const { error } = await supabase.rpc("submit_monolith_post", {
        p_title: title,
        p_body: body,
      });

      if (error) {
        if (
          error.message === "You are not the chosen author for this day" ||
          error.message === "This day is assigned to another chosen author"
        ) {
          setPostSaveError("You're not today's chosen author.");
        } else {
          setPostSaveError(error.message || "Couldn't publish today's monolith.");
        }
        return;
      }

      setPostSaveSuccess(
        dailyPost ? "Monolith updated for today." : "Monolith published for today."
      );
      refreshDailySnapshot();
    } catch {
      setPostSaveError("Couldn't publish today's monolith.");
    } finally {
      setPostSaving(false);
    }
  }, [
    dailyPost,
    draftBody,
    draftTitle,
    isCurrentUserChosen,
    refreshDailySnapshot,
    sessionUserId,
  ]);

  const canSubmit =
    !postSaving &&
    draftTitle.trim().length >= TITLE_MIN &&
    draftBody.trim().length >= BODY_MIN;

  const dayLabel = useMemo(
    () => formatUtcDay(chosenInfo?.day ?? clientUtcDayIso),
    [chosenInfo?.day, clientUtcDayIso]
  );

  const postUpdatedUtc = useMemo(
    () => formatUtcTimestamp(dailyPost?.updated_at ?? null),
    [dailyPost?.updated_at]
  );

  return {
    chosenInfo,
    chosenLoading,
    chosenError,
    dailyPost,
    postLoading,
    postError,
    dayLabel,
    postUpdatedUtc,
    isCurrentUserChosen,
    draftTitle,
    draftBody,
    postSaving,
    postSaveError,
    postSaveSuccess,
    canSubmit,
    onDraftTitleChange,
    onDraftBodyChange,
    submitDailyPost,
    refreshDailySnapshot,
  };
}

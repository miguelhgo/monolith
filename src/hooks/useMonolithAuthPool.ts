import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_WAITING,
  normalizeUsername,
  usernameValidationMessage,
  type OAuthProvider,
} from "../lib/monolith";

export function useMonolithAuthPool() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [waitingCount, setWaitingCount] = useState<number | null>(
    supabase ? null : DEFAULT_WAITING
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInputState] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [poolLoading, setPoolLoading] = useState(false);
  const [poolPosition, setPoolPosition] = useState<number | null>(null);

  const refreshWaitingCount = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.rpc("get_waiting_count");
      if (error) throw error;

      const parsed = typeof data === "number" ? data : Number(data);
      if (Number.isFinite(parsed)) {
        setWaitingCount(parsed);
        return;
      }
    } catch {
      // Keep last known value if RPC fails.
    }

    setWaitingCount((previous) => previous ?? DEFAULT_WAITING);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    refreshWaitingCount();
    const timer = window.setInterval(refreshWaitingCount, 20000);
    return () => window.clearInterval(timer);
  }, [refreshWaitingCount]);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setAuthError("Couldn't verify auth session.");
      setSession(data.session);
      setAuthReady(true);
    };

    initAuth();

    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
        setSession(nextSession);
        setOauthLoading(null);
      }
    );

    return () => authSub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setUsername(null);
      setPoolPosition(null);
      setUsernameInputState("");
      setProfileLoading(false);
      setPoolLoading(false);
      return;
    }

    let cancelled = false;
    const userId = session.user.id;

    const loadProfile = async () => {
      setProfileLoading(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setAuthError("Couldn't load your profile.");
        setProfileLoading(false);
        return;
      }

      setUsername(profile?.username ?? null);
      setProfileLoading(false);
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !session || !username) {
      if (!username) {
        setPoolPosition(null);
        setPoolLoading(false);
      }
      return;
    }

    let cancelled = false;
    const userId = session.user.id;

    const reservePoolPosition = async () => {
      setPoolLoading(true);

      const { data: existingEntry, error: existingEntryError } = await supabase
        .from("pool_entries")
        .select("position")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      if (existingEntryError) {
        setAuthError("Couldn't reserve your pool position.");
        setPoolLoading(false);
        return;
      }

      let position = existingEntry?.position ?? null;

      if (position === null) {
        const { data: insertedEntry, error: insertError } = await supabase
          .from("pool_entries")
          .insert({ user_id: userId })
          .select("position")
          .single();

        if (cancelled) return;
        if (insertError && insertError.code !== "23505") {
          setAuthError("Couldn't reserve your pool position.");
          setPoolLoading(false);
          return;
        }

        if (insertedEntry?.position !== undefined) {
          position = insertedEntry.position;
        }
      }

      if (position === null) {
        const { data: entry, error: entryError } = await supabase
          .from("pool_entries")
          .select("position")
          .eq("user_id", userId)
          .single();

        if (cancelled) return;
        if (entryError) {
          setAuthError("Couldn't read your pool position.");
          setPoolLoading(false);
          return;
        }

        position = entry.position;
      }

      const { data: rankData, error: rankError } = await supabase.rpc("get_pool_rank", {
        p_user_id: userId,
      });

      if (cancelled) return;

      const parsedRank = typeof rankData === "number" ? rankData : Number(rankData);
      if (!rankError && Number.isFinite(parsedRank)) {
        setPoolPosition(parsedRank);
      } else {
        setPoolPosition(position);
      }

      setPoolLoading(false);
      refreshWaitingCount();
    };

    reservePoolPosition();

    return () => {
      cancelled = true;
    };
  }, [session, username, refreshWaitingCount]);

  const setUsernameInput = useCallback((value: string) => {
    setUsernameInputState(value);
    setUsernameError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const startOAuth = useCallback(async (provider: OAuthProvider) => {
    if (!supabase) return;
    setAuthError(null);
    setOauthLoading(provider);

    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setAuthError(`Couldn't start ${provider} login.`);
      setOauthLoading(null);
    }
  }, []);

  const saveUsername = useCallback(async () => {
    if (!supabase || !session) return;

    if (username) {
      setUsernameError("Username is already set and cannot be changed.");
      return;
    }

    const normalized = normalizeUsername(usernameInput);
    const validationError = usernameValidationMessage(normalized);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setUsernameSaving(true);
    setUsernameError(null);

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: session.user.id, username: normalized }, { onConflict: "user_id" });

    if (error) {
      if (error.code === "23505") {
        setUsernameError("That username is taken. Try another one.");
      } else if (error.message === "Username is immutable once set") {
        setUsernameError("Username is already set and cannot be changed.");
      } else {
        setUsernameError("Couldn't save username. Try again.");
      }
      setUsernameSaving(false);
      return;
    }

    setUsername(normalized);
    setUsernameInputState("");
    setUsernameSaving(false);
  }, [session, username, usernameInput]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthError(null);
    setUsername(null);
    setPoolPosition(null);
  }, []);

  const showUsernameStep = Boolean(session && !username);
  const showReadyState = Boolean(session && username);
  const isBusy = useMemo(
    () => !authReady || profileLoading || poolLoading,
    [authReady, profileLoading, poolLoading]
  );

  return {
    session,
    authReady,
    waitingCount,
    authError,
    oauthLoading,
    profileLoading,
    username,
    usernameInput,
    usernameSaving,
    usernameError,
    poolLoading,
    poolPosition,
    showUsernameStep,
    showReadyState,
    isBusy,
    setUsernameInput,
    clearAuthError,
    startOAuth,
    saveUsername,
    signOut,
  };
}

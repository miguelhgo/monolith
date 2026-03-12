import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface VoteEntry {
  target_type: string;
  target_id: number;
  value: number;
}

function voteKey(targetType: string, targetId: number): string {
  return `${targetType}:${targetId}`;
}

interface UseVotesArgs {
  day: string | null;
  isAuthenticated: boolean;
}

export function useVotes({ day, isAuthenticated }: UseVotesArgs) {
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserVotes = useCallback(async () => {
    if (!supabase || !day || !isAuthenticated) {
      setUserVotes(new Map());
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("get_user_votes_for_day", {
        p_day: day,
      });

      if (!isMountedRef.current) return;

      if (error) {
        setLoading(false);
        return;
      }

      const map = new Map<string, number>();
      for (const entry of (data ?? []) as VoteEntry[]) {
        map.set(voteKey(entry.target_type, Number(entry.target_id)), Number(entry.value));
      }
      setUserVotes(map);
    } catch {
      // Keep existing state
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [day, isAuthenticated]);

  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  const getUserVote = useCallback(
    (targetType: string, targetId: number): number => {
      return userVotes.get(voteKey(targetType, targetId)) ?? 0;
    },
    [userVotes]
  );

  const castVote = useCallback(
    async (
      targetType: string,
      targetId: number,
      value: 1 | -1
    ): Promise<string | null> => {
      if (!supabase || !isAuthenticated) return null;

      const key = voteKey(targetType, targetId);
      const currentVote = userVotes.get(key) ?? 0;

      // Optimistic update
      setUserVotes((prev) => {
        const next = new Map(prev);
        if (currentVote === value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });

      try {
        const { data, error } = await supabase.rpc("cast_vote", {
          p_target_type: targetType,
          p_target_id: targetId,
          p_value: value,
        });

        if (error) {
          // Revert optimistic update
          setUserVotes((prev) => {
            const next = new Map(prev);
            if (currentVote === 0) {
              next.delete(key);
            } else {
              next.set(key, currentVote);
            }
            return next;
          });
          return null;
        }

        return data as string;
      } catch {
        // Revert optimistic update
        setUserVotes((prev) => {
          const next = new Map(prev);
          if (currentVote === 0) {
            next.delete(key);
          } else {
            next.set(key, currentVote);
          }
          return next;
        });
        return null;
      }
    },
    [isAuthenticated, userVotes]
  );

  return {
    userVotes,
    loading,
    getUserVote,
    castVote,
    refresh: fetchUserVotes,
  };
}

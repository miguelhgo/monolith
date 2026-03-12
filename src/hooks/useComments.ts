import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export interface CommentRow {
  id: number;
  day: string;
  user_id: string;
  parent_id: number | null;
  body: string;
  votes_up: number;
  votes_down: number;
  created_at: string;
  username: string;
}

export interface CommentNode extends CommentRow {
  replies: CommentNode[];
}

function buildTree(flat: CommentRow[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const row of flat) {
    map.set(row.id, { ...row, replies: [] });
  }

  for (const node of map.values()) {
    if (node.parent_id !== null) {
      const parent = map.get(node.parent_id);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

interface UseCommentsArgs {
  day: string | null;
  enabled?: boolean;
}

export function useComments({ day, enabled = true }: UseCommentsArgs) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [flat, setFlat] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchComments = useCallback(async () => {
    if (!supabase || !day || !enabled) return;

    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("get_comments_for_day", {
        p_day: day,
      });

      if (!isMountedRef.current || reqId !== requestIdRef.current) return;

      if (rpcError) {
        setError("Couldn't load comments.");
        return;
      }

      const rows: CommentRow[] = (data ?? []).map((r: Record<string, unknown>) => ({
        id: Number(r.id),
        day: String(r.day),
        user_id: String(r.user_id),
        parent_id: r.parent_id !== null ? Number(r.parent_id) : null,
        body: String(r.body),
        votes_up: Number(r.votes_up ?? 0),
        votes_down: Number(r.votes_down ?? 0),
        created_at: String(r.created_at),
        username: String(r.username ?? "anonymous"),
      }));

      setFlat(rows);
      setComments(buildTree(rows));
    } catch {
      if (!isMountedRef.current || reqId !== requestIdRef.current) return;
      setError("Couldn't load comments.");
    } finally {
      if (isMountedRef.current && reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [day, enabled]);

  // Initial fetch + auto-refresh every 15s
  useEffect(() => {
    if (!supabase || !day || !enabled) {
      setComments([]);
      setFlat([]);
      setLoading(false);
      return;
    }

    fetchComments();
    const timer = window.setInterval(fetchComments, 15000);
    return () => window.clearInterval(timer);
  }, [fetchComments, day, enabled]);

  const submitComment = useCallback(
    async (body: string, parentId: number | null = null) => {
      if (!supabase || !day) return;

      setSubmitting(true);
      setError(null);

      try {
        const { error: rpcError } = await supabase.rpc("submit_comment", {
          p_day: day,
          p_body: body,
          p_parent_id: parentId,
        });

        if (rpcError) {
          setError(rpcError.message || "Couldn't post comment.");
          return false;
        }

        await fetchComments();
        return true;
      } catch {
        setError("Couldn't post comment.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [day, fetchComments]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!supabase) return;

      try {
        const { error: rpcError } = await supabase.rpc("delete_comment", {
          p_comment_id: commentId,
        });

        if (rpcError) {
          setError(rpcError.message || "Couldn't delete comment.");
          return false;
        }

        await fetchComments();
        return true;
      } catch {
        setError("Couldn't delete comment.");
        return false;
      }
    },
    [fetchComments]
  );

  return {
    comments,
    flat,
    loading,
    error,
    submitting,
    submitComment,
    deleteComment,
    refresh: fetchComments,
  };
}

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LiveReaders() {
  const [count, setCount] = useState<number | null>(null);
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel("readers", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        let total = 0;
        for (const key of Object.keys(state)) {
          total += state[key].length;
        }
        setCount(total);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, []);

  if (count === null) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "11px",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "#10b981",
          animation: "livePulse 2s ease infinite",
          flexShrink: 0,
        }}
      />
      <span>
        <span style={{ color: "#10b981", fontWeight: 600 }}>
          {formatNum(count)}
        </span>{" "}
        reading
      </span>
    </div>
  );
}

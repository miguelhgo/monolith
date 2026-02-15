import { useState, useEffect } from "react";

interface Props {
  size?: "sm" | "lg";
}

export default function Countdown({ size = "sm" }: Props) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const diff = +tomorrow - +now;
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const fontSize = size === "lg" ? "28px" : "13px";

  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize,
        fontWeight: 600,
        color: "#e85d26",
        letterSpacing: "1px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {pad(time.h)}
      <span style={{ color: "#2a2a34", margin: "0 1px" }}>:</span>
      {pad(time.m)}
      <span style={{ color: "#2a2a34", margin: "0 1px" }}>:</span>
      {pad(time.s)}
    </span>
  );
}

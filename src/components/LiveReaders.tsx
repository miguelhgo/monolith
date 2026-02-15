import { useState, useEffect } from "react";

function formatNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LiveReaders() {
  const [count, setCount] = useState(4329);

  useEffect(() => {
    const i = setInterval(
      () => setCount((c) => c + Math.floor(Math.random() * 7) - 3),
      3000
    );
    return () => clearInterval(i);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "11px",
        color: "#4a4a56",
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

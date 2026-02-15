import { useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";

export default function BellButton() {
  const [notifyOn, setNotifyOn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = () => {
    setNotifyOn(!notifyOn);
    if (!notifyOn) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggle}
        style={{
          background: notifyOn ? "rgba(232,93,38,0.1)" : "transparent",
          border: `1px solid ${notifyOn ? "rgba(232,93,38,0.2)" : "#1a1a24"}`,
          borderRadius: "8px",
          padding: "6px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: notifyOn ? "#e85d26" : "#3a3a46",
          transition: "all 0.2s",
        }}
      >
        {notifyOn ? <Bell size={15} /> : <BellOff size={15} />}
      </button>
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#16161e",
            border: "1px solid #2a2a34",
            borderRadius: "8px",
            padding: "8px 12px",
            whiteSpace: "nowrap",
            zIndex: 10,
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            color: "#b0b0be",
            animation: "fadeIn 0.2s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Check
            size={11}
            style={{ color: "#10b981", marginRight: "6px" }}
          />
          You'll be notified daily at midnight UTC
        </div>
      )}
    </div>
  );
}

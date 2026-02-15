import { useState } from "react";
import { Users, Sparkles, Eye, Clock, X, HelpCircle } from "lucide-react";

export default function HowItWorks() {
  const [show, setShow] = useState(false);

  const steps = [
    { icon: <Users size={18} />, title: "Join the pool", desc: "Sign up and get your number" },
    { icon: <Sparkles size={18} />, title: "Algorithm chooses", desc: "One random person, every day" },
    { icon: <Eye size={18} />, title: "Speak to the world", desc: "Write anything. The world reads." },
    { icon: <Clock size={18} />, title: "24 hours", desc: "Then it disappears forever" },
  ];

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          background: "none",
          border: "1px solid #1a1a24",
          borderRadius: "8px",
          padding: "6px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#3a3a46",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#7a7a8a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a46")}
      >
        <HelpCircle size={15} />
      </button>

      {show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShow(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0e0e14",
              border: "1px solid #1a1a24",
              borderRadius: "14px",
              padding: "28px",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                How Monolith works
              </span>
              <button
                onClick={() => setShow(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#4a4a56",
                  display: "flex",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderTop: i > 0 ? "1px solid #12121a" : "none",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    background: "rgba(232,93,38,0.08)",
                    border: "1px solid rgba(232,93,38,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e85d26",
                  }}
                >
                  {step.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e0e0e8",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "12px",
                      color: "#4a4a56",
                      marginTop: "2px",
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

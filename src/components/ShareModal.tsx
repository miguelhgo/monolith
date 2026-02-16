import { useState } from "react";
import { Share2, X, Check, Link2 } from "lucide-react";

export default function ShareModal() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = "https://themonolith.today";
  const text =
    "Today's monolith hit different. One chosen voice, one day, gone forever.";

  const copyLink = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid #16161e",
          borderRadius: "10px",
          padding: "5px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: "'DM Mono', monospace",
          fontSize: "11px",
          color: "#7a7a8a",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#2a2a34";
          e.currentTarget.style.color = "#7a7a8a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#16161e";
        }}
      >
        <Share2 size={12} /> share
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
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                Share this monolith
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

            {/* Twitter/X */}
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                  "_blank"
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "#0c0c12",
                border: "1px solid #1a1a24",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                color: "#b0b0be",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a34")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a24")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>

            {/* WhatsApp */}
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
                  "_blank"
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                background: "#0c0c12",
                border: "1px solid #1a1a24",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                color: "#b0b0be",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a34")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a24")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>

            {/* Copy link */}
            <button
              onClick={copyLink}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0c0c12",
                border: "1px solid #1a1a24",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#b0b0be",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a34")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a24")}
            >
              {copied ? (
                <>
                  <Check size={16} style={{ color: "#10b981" }} /> Copied!
                </>
              ) : (
                <>
                  <Link2 size={16} style={{ color: "#e85d26" }} /> Copy link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

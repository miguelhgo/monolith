import { useState, useEffect } from "react";
import {
  LogIn, HelpCircle, Sparkles, Clock, Bell, Eye, ChevronRight,
  ArrowUp, MessageCircle, Share2, Flag, Loader2,
} from "lucide-react";
import Countdown from "./Countdown";
import LiveReaders from "./LiveReaders";
import VoteButton from "./VoteButton";
import Comments from "./Comments";
import CommentInput from "./CommentInput";
import ShareModal from "./ShareModal";
import AuthModal from "./AuthModal";
import HowItWorks from "./HowItWorks";
import BellButton from "./BellButton";
import LotteryTicket from "./LotteryTicket";
import EmptyState from "./EmptyState";
import StickyCTA from "./StickyCTA";

/* ─── SAMPLE DATA ─── */
const COMMENTS_DATA = [
  {
    id: 1, user: "astra_nova", time: "2h ago", votes: 847,
    text: "This is exactly what I needed to read today. I\u2019ve been working on something nobody understands for 3 years and sometimes you doubt yourself. Thanks for reminding me the weird path is valid.",
    replies: [
      {
        id: 11, user: "pixel_monk", time: "1h ago", votes: 312,
        text: "Same. Left a 90k job to make generative art. My family thinks I\u2019m insane. But I\u2019ve never been happier.",
        replies: [
          {
            id: 111, user: "neon_drift", time: "45m ago", votes: 89,
            text: "Generative art has a massive future. You\u2019re not crazy, you\u2019re early.",
            replies: [
              {
                id: 1111, user: "deep_thread", time: "20m ago", votes: 34,
                text: "Absolutely. The tools are getting insane. Wait until real-time generative visuals hit mainstream concerts and events.",
                replies: [
                  { id: 11111, user: "buried_voice", time: "10m ago", votes: 12, text: "Already happening in Tokyo. Saw a Rhizomatiks show last month that was 100% AI-driven visuals.", replies: [] },
                ],
              },
            ],
          },
          { id: 112, user: "quiet_storm", time: "30m ago", votes: 156, text: "90k doesn\u2019t buy peace of mind. Good call.", replies: [] },
        ],
      },
      { id: 12, user: "void_walker", time: "1h 30m ago", votes: 203, text: "\u201CThe weird path is valid\u201D should be a tattoo.", replies: [] },
    ],
  },
  {
    id: 2, user: "terra_byte", time: "3h ago", votes: 1203,
    text: "Writing from Nairobi. Here, building in tech is almost an act of resistance. Infrastructure is fragile, internet drops constantly, but we keep going. Every line of code feels like planting a flag. This post reminds me we\u2019re not alone in this madness. Sometimes all you need is one voice telling you to keep pushing, and today that voice came from Berlin.",
    replies: [
      {
        id: 21, user: "sahel_coder", time: "2h ago", votes: 445,
        text: "Dakar here. The African tech scene is about to explode this decade. Hold on.",
        replies: [
          { id: 211, user: "lagos_dev", time: "1h ago", votes: 267, text: "Lagos checking in. Flutterwave, Paystack\u2026 we\u2019re already exploding. The world just hasn\u2019t noticed yet.", replies: [] },
        ],
      },
      { id: 22, user: "maple_root", time: "2h 15m ago", votes: 178, text: "Canada here. We have all the infrastructure and half the devs I know are still burned out. The passion you describe is what actually matters.", replies: [] },
    ],
  },
  {
    id: 3, user: "cipher_punk", time: "4h ago", votes: 2041,
    text: "Hot take: this one-voice-per-day format is more honest than any social network. No algorithm, no clout chasing, just one person speaking into the void. Poetic.",
    replies: [
      { id: 31, user: "meta_mind", time: "3h ago", votes: 534, text: "It\u2019s like Hyde Park\u2019s Speaker\u2019s Corner but for 8 billion people. I love it.", replies: [] },
    ],
  },
];

const POST_PREVIEW = "For 6 years I asked for validation. From investors, mentors, strangers on Twitter. Every \u201Cit\u2019s not the right time\u201D or \u201Cthe market isn\u2019t ready\u201D paralyzed me a little more\u2026";
const POST_FULL = [
  "For 6 years I asked for validation. From investors, mentors, strangers on Twitter. Every \u201Cit\u2019s not the right time\u201D or \u201Cthe market isn\u2019t ready\u201D paralyzed me a little more. I was building MVPs to convince others instead of solving real problems.",
  "One day, in a caf\u00E9 in Gr\u00E0cia, I stopped asking. I opened my laptop and started building exactly what I needed. No pitch deck. No TAM/SAM/SOM. No thinking about whether it scaled.",
  "Three months later I had 400 users who had found it on their own. Not because I had done marketing, but because when you build something real, people find it. Like water finding cracks.",
  null,
  "Today the algorithm chose me. Tomorrow it\u2019ll choose someone else. But if you\u2019re reading this and you have that thing you keep postponing \u2014 stop waiting. Nobody is going to give you the green light. The green light is you opening your laptop and starting.",
];
const QUOTE = "The difference between those who build and those who dream of building isn\u2019t talent. It\u2019s the moment you stop asking for permission.";

/* ─── MAIN PAGE ─── */
export default function MonolithPage() {
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [notifyOn, setNotifyOn] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  const handleLogin = () => { setIsLoggedIn(true); setShowAuth(false); };

  return (
    <div style={{ paddingBottom: isLoggedIn ? "20px" : "90px" }}>
      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}

      <div style={{
        maxWidth: "640px", margin: "0 auto", padding: "0 20px",
        opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* ━━━ HEADER ━━━ */}
        <header style={{ padding: "24px 0 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "5px", height: "22px", background: "linear-gradient(180deg, #e85d26, #e85d2630)", borderRadius: "3px" }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "19px", fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>monolith</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HowItWorks />
            {isLoggedIn ? (
              <BellButton />
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                background: "transparent", border: "1px solid #1a1a24", borderRadius: "8px",
                padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#7a7a8a", transition: "all 0.2s",
              }}><LogIn size={13} /> sign in</button>
            )}
          </div>
        </header>

        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1a1a24, transparent)" }} />

        {/* ━━━ EMPTY STATE ━━━ */}
        {showEmpty ? (
          <EmptyState isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} onNotify={() => setNotifyOn(true)} />
        ) : (
          <>
            {/* ━━━ SPEAKER CARD ━━━ */}
            <div style={{ padding: "18px 0", animation: loaded ? "fadeIn 0.5s ease 0.1s both" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #e85d26, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "17px", fontWeight: 800, color: "#fff",
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: "0 0 20px rgba(232,93,38,0.12)",
                  }}>K</div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#fff" }}>kara_builds</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#3a3a46", marginTop: "1px" }}>Berlin, Germany &middot; #847</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#e85d26", animation: "livePulse 2s ease infinite" }} />
                  <Countdown />
                </div>
              </div>
              {/* Live stats row */}
              <div style={{
                display: "flex", alignItems: "center", gap: "16px", marginTop: "12px",
                padding: "10px 14px", background: "rgba(255,255,255,0.02)",
                borderRadius: "8px", border: "1px solid #12121a",
              }}>
                <LiveReaders />
                <div style={{ width: "1px", height: "14px", background: "#1a1a24" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#4a4a56" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  <span><span style={{ color: "#6366f1", fontWeight: 600 }}>89</span> countries</span>
                </div>
                <div style={{ width: "1px", height: "14px", background: "#1a1a24" }} />
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#3a3a46" }}>Feb 15, 2026</div>
              </div>
            </div>

            {/* ━━━ THE POST ━━━ */}
            <article style={{ padding: "4px 0 24px", animation: loaded ? "fadeIn 0.5s ease 0.2s both" : "none" }}>
              <h1 style={{
                fontFamily: "'Newsreader', Georgia, serif", fontSize: "26px", fontWeight: 700,
                lineHeight: 1.35, color: "#f0f0f4", margin: "0 0 16px", letterSpacing: "-0.2px",
              }}>I stopped asking for permission to build what I wanted to build</h1>

              {!expanded && (
                <div>
                  <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "16px", lineHeight: 1.8, color: "#9090a0", margin: "0 0 16px" }}>{POST_PREVIEW}</p>
                  <div style={{ position: "relative", height: "48px", background: "linear-gradient(180deg, rgba(8,8,12,0), #08080c)", marginTop: "-48px", marginBottom: "12px" }} />
                  <button onClick={() => setExpanded(true)} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "rgba(232,93,38,0.06)", border: "1px solid rgba(232,93,38,0.12)",
                    borderRadius: "8px", padding: "10px 18px", cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 500,
                    color: "#b0b0be", width: "100%", justifyContent: "center",
                  }}>
                    <Eye size={14} style={{ color: "#e85d26" }} />
                    Read today's monolith
                    <ChevronRight size={14} style={{ color: "#e85d26" }} />
                  </button>
                </div>
              )}

              {expanded && (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                  <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: "16px", lineHeight: 1.8, color: "#9090a0" }}>
                    {POST_FULL.map((para, i) =>
                      para === null ? (
                        <div key={i} style={{
                          margin: "24px 0", padding: "20px 24px", borderLeft: "2px solid #e85d26",
                          background: "linear-gradient(90deg, rgba(232,93,38,0.04), transparent)",
                          borderRadius: "0 8px 8px 0",
                        }}>
                          <p style={{ margin: 0, fontStyle: "italic", fontSize: "17px", lineHeight: 1.7, color: "#c8c8d4" }}>{QUOTE}</p>
                        </div>
                      ) : <p key={i} style={{ margin: "0 0 16px" }}>{para}</p>
                    )}
                  </div>
                  <button onClick={() => setExpanded(false)} style={{
                    display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "11px",
                    color: "#3a3a46", padding: "4px 0", marginTop: "4px",
                  }}><ArrowUp size={12} /> Collapse</button>
                </div>
              )}

              {/* Post stats */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #12121a", flexWrap: "wrap",
              }}>
                <VoteButton votes={14832} size="lg" />
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#3a3a46", display: "flex", alignItems: "center", gap: "5px" }}><MessageCircle size={13} /> 1,247</div>
                <div style={{ flex: 1 }} />
                <ShareModal />
                <button style={{
                  background: "none", border: "1px solid #16161e", borderRadius: "6px",
                  padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                  fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#3a3a46", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a2a34"; e.currentTarget.style.color = "#7a7a8a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#16161e"; e.currentTarget.style.color = "#3a3a46"; }}
                ><Flag size={11} /> report</button>
              </div>
            </article>

            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1a1a24, transparent)" }} />

            {/* ━━━ LOTTERY TICKET ━━━ */}
            {isLoggedIn && (
              <div style={{ padding: "16px 0 8px", animation: "slideUp 0.4s ease" }}>
                <LotteryTicket />
              </div>
            )}

            {/* ━━━ COMMENT INPUT ━━━ */}
            <CommentInput isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} />

            {/* ━━━ COMMENTS ━━━ */}
            <Comments comments={COMMENTS_DATA} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} />
          </>
        )}

        {/* ━━━ FOOTER ━━━ */}
        <div style={{
          padding: "20px 0 32px", borderTop: "1px solid #12121a",
          display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
        }}>
          <Clock size={10} style={{ color: "#1a1a24" }} />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#1a1a24", letterSpacing: "2px", textTransform: "uppercase" }}>tomorrow, another voice rises</p>
        </div>
      </div>

      {/* ━━━ STICKY CTA ━━━ */}
      {!isLoggedIn && <StickyCTA onLoginClick={() => setShowAuth(true)} />}
    </div>
  );
}

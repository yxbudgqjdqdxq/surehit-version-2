
// pages/chat.js  (frontend) — REPLACE your current frontend with this
import React, { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState(null);
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const cardRef = useRef(null);

  // local mood detection (same as backend)
  function detectMoodLocal(text) {
    const t = (text || "").toLowerCase();
    if (/(sad|tired|down|cry|hurt|lonely|gloomy|blue|bummed|drained|weary)/.test(t)) return "sad";
    if (/(mad|pissed|angry|annoyed|hate|furious|triggered|fed up|salty)/.test(t)) return "grumpy";
    if (/(happy|yay|lol|fun|win|vibe|stoked|hyped|thrilled|joy)/.test(t)) return "happy";
    if (/(love|babe|cute|kiss|crush|darling|adore|snuggle)/.test(t)) return "love";
    if (/(heart|soul|life|dream|forever|purpose|deep|reflect)/.test(t)) return "deep";
    if (/(bored|meh|yawn|idle|slow|unimpressed)/.test(t)) return "bored";
    if (/(nervous|anxious|jitters|scared|insecure|worried|panic)/.test(t)) return "nervous";
    if (/(confident|boss|alpha|bold|swagger|unstoppable)/.test(t)) return "confident";
    if (/(playful|silly|mischief|chaos|goofy|unhinged)/.test(t)) return "playful";
    return "neutral";
  }

  // robust fetch to /api/chat — it expects { message }
  async function fetchReply(messageToSend) {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend || "" })
      });

      // If not JSON, read text to reveal server error (helps debug)
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) {
        // capture body as text to show server's error if any
        const text = await r.text();
        throw new Error(`Server error ${r.status}: ${text}`);
      }

      if (ct.includes("application/json")) {
        const data = await r.json();
        setReply(data.reply || "…");
        setMood(data.mood || detectMoodLocal(messageToSend));
      } else {
        // server returned something that's not JSON -> show it
        const text = await r.text();
        throw new Error("Non-JSON response: " + text);
      }
    } catch (err) {
      console.error("fetchReply error:", err);
      setError(String(err));
    } finally {
      setLoading(false);
      // animate card for UX
      if (cardRef.current) {
        cardRef.current.animate(
          [{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0px)", opacity: 1 }],
          { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" }
        );
      }
    }
  }

  useEffect(() => {
    // initial load: get a default line (backend will fallback to neutral)
    fetchReply("");
  }, []);

  const handleSend = async (e) => {
    e && e.preventDefault();
    const text = input.trim();
    if (!text) {
      await fetchReply(lastMessage || "");
      return;
    }
    setLastMessage(text);
    setInput("");
    setMood(detectMoodLocal(text));
    await fetchReply(text);
  };

  const handleAnother = async () => {
    await fetchReply(lastMessage || "");
  };

  const gradients = {
    sad: "linear-gradient(135deg,#1f3a93,#3a6073)",
    grumpy: "linear-gradient(135deg,#3b0a3b,#872657)",
    happy: "linear-gradient(135deg,#ffefba,#ffd1ff)",
    love: "linear-gradient(135deg,#ff9a9e,#fecfef)",
    deep: "linear-gradient(135deg,#2b5876,#4e4376)",
    neutral: "linear-gradient(135deg,#f0f2f5,#ffffff)",
    bored: "linear-gradient(135deg,#d7d2cc,#304352)",
    nervous: "linear-gradient(135deg,#ffd89b,#19547b)",
    confident: "linear-gradient(135deg,#f7797d,#FBD786)",
    playful: "linear-gradient(135deg,#fbc2eb,#a6c1ee)"
  };

  const currentGradient = gradients[mood] || gradients.neutral;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: currentGradient, transition: "background 600ms ease" }}>
      <div style={{ width: "100%", maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, letterSpacing: -0.3 }}>Daily Affirmations</h1>
            <div style={{ color: "rgba(0,0,0,0.6)", marginTop: 6, fontSize: 13 }}>For my baby — warmth, hype, and soft honesty.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleAnother} disabled={loading} style={{ padding: "8px 14px", borderRadius: 12, border: "none", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", cursor: "pointer", transition: "transform .15s ease", fontWeight: 600 }}>
              Another one
            </button>
          </div>
        </header>

        <main ref={cardRef} style={{ background: "rgba(255,255,255,0.92)", borderRadius: 20, padding: "36px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)", minHeight: 260, display: "flex", flexDirection: "column", justifyContent: "center", transition: "transform .3s ease" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#333" }}>Hypeman is thinking…</div>
          ) : (
            <>
              <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(18px, 2.2vw, 22px)", lineHeight: 1.45, color: "#111", textAlign: "center", whiteSpace: "pre-wrap" }}>
                {reply || "Type how you feel — I’ll say the rest."}
              </div>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.45)" }}>Mood: <strong style={{ textTransform: "capitalize" }}>{mood}</strong></div>
              </div>
            </>
          )}
        </main>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input value={input} onChange={e => { setInput(e.target.value); setMood(detectMoodLocal(e.target.value)); }} placeholder="Type what you're feeling (eg: 'I feel tired today', 'I'm so happy')" style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", fontSize: 15 }} disabled={loading} aria-label="Your message" />
          <button type="submit" disabled={loading} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "#b21b61", color: "#fff", fontWeight: 700, cursor: "pointer", transition: "transform .12s ease" }}>
            {loading ? "Sending…" : (lastMessage ? "Send" : "Get one")}
          </button>
        </form>

        {error && <div style={{ color: "crimson", fontSize: 13, whiteSpace: "pre-wrap" }}>{error}</div>}
        <footer style={{ marginTop: 10, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>Tip: Try mentioning how you feel in one sentence — the reply will match the mood.</footer>
      </div>
    </div>
  );
}
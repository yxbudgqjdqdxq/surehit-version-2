
// pages/chat.js
import React, { useState, useEffect, useRef } from "react";


import dynamic from 'next/dynamic';
const OfflineHypeChat = dynamic(() => import('../components/OfflineHypeChat'), { ssr: false });

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState(null);
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const [emptyClickCount, setEmptyClickCount] = useState(0);
  const [lastSentText, setLastSentText] = useState("");
  const cardRef = useRef(null);
  const [useOffline, setUseOffline] = useState(false);

  // mood detection
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

  // emoji-only detection (basic): if no alphanumeric characters, treat as emoji-only
  function isEmojiOnly(str) {
    if (!str) return false;
    // if contains any letter/number, it's not emoji-only
    if (/[A-Za-z0-9]/.test(str)) return false;
    // treat other-letters as alpha too (unicode letters)
    if (/\p{Letter}/u.test(str)) return false;
    // if contains non-space characters but no letters/numbers treat as emoji/symbols
    return /\S/.test(str);
  }

  // ensure full-screen gradient for PC: apply to body
  useEffect(() => {
    const gradients = {
      sad: "linear-gradient(135deg,#cfe0ff,#9fb7ff)",
      grumpy: "linear-gradient(135deg,#ffdbe6,#ffb3d6)",
      happy: "linear-gradient(135deg,#fff0b8,#ffd6a5)",
      love: "linear-gradient(135deg,#ffd6e8,#ff9ab6)",
      deep: "linear-gradient(135deg,#d8f3ff,#cde6ff)",
      neutral: "linear-gradient(135deg,#f0f2f5,#ffffff)",
      bored: "linear-gradient(135deg,#f0e6ff,#e6d8ff)",
      nervous: "linear-gradient(135deg,#fff0f0,#ffe8d9)",
      confident: "linear-gradient(135deg,#ffd1b8,#ffb3b3)",
      playful: "linear-gradient(135deg,#f0d8ff,#e6f0ff)"
    };
    const g = gradients[mood] || gradients.neutral;
    document.body.style.background = g;
    document.body.style.transition = "background 600ms ease";
    return () => {
      // leave background as-is; this is fine for your app's single-page usage
    };
  }, [mood]);

  async function callApi(message) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message || "" })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error: ${txt}`);
      }
      const data = await res.json();
      return data.reply ?? "";
    } catch (err) {
      console.error("API error:", err);
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial fetch
    (async () => {
      const initial = await callApi("");
      if (initial) setReply(initial);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (e) => {
    e && e.preventDefault();
    setError(null);
    const text = input.trim();

    // EMPTY behavior: count clicks
    if (!text) {
      const next = emptyClickCount + 1;
      setEmptyClickCount(next);
      if (next >= 2) {
        setReply("say something my love");
        setEmptyClickCount(0);
      } else {
        setReply("Tap once more and say something, babe.");
      }
      return;
    }

    // EMOJI ONLY behavior
    if (isEmojiOnly(text)) {
      setReply("Sorry?");
      setInput("");
      return;
    }

    // prevent identical repeat spam
    if (text === lastSentText) {
      setReply("say something my love");
      setInput("");
      return;
    }

    setLastSentText(text);
    setLastMessage(text);
    setInput("");
    setMood(detectMoodLocal(text));
    setLoading(true);

    const r = await callApi(text);
    if (r !== null) {
      setReply(r);
    } else {
      setReply("Sorry — couldn't fetch a reply.");
    }

    if (cardRef.current) {
      cardRef.current.animate(
        [{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0px)", opacity: 1 }],
        { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" }
      );
    }
  };

  const handleAnother = async () => {
    const target = lastMessage || "";
    setMood(detectMoodLocal(target));
    setLoading(true);
    const r = await callApi(target);
    if (r !== null) setReply(r);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {useOffline ? <OfflineHypeChat personaName={'Ayesha'} /> : null}

      <div style={{ width: "100%", maxWidth: 920 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>Daily Affirmations</h1>
            <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>For my baby — love, comfort, and endless hype.</div>
          </div>

          <div>
            <button onClick={handleAnother} disabled={loading} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.18)", color: "#000" }}>
              Another one
            </button>
          </div>
        </header>

        <main ref={cardRef} style={{ background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: 30, minHeight: 240, boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#333" }}>Hypeman is thinking…</div>
          ) : (
            <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(18px, 2.2vw, 22px)", textAlign: "center", color: "#111", whiteSpace: "pre-wrap" }}>
              {reply || "Type how you feel — I’ll say the rest."}
            </div>
          )}

          <div style={{ marginTop: 12, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>
            Mood: <strong style={{ textTransform: "capitalize" }}>{mood}</strong>
          </div>
        </main>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setMood(detectMoodLocal(e.target.value)); }}
            placeholder="Type how you're feeling (e.g. 'i feel tired', 'i'm happy')"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}
            disabled={loading}
            aria-label="Your message"
          />
          <button type="submit" disabled={loading} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "#b21b61", color: "#fff", fontWeight: 700 }}>
            {loading ? "Sending…" : "Send"}
          </button>
        </form>

        {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}

        <div style={{textAlign:'center', marginTop:12}}>
          <label style={{display:'inline-flex',alignItems:'center',gap:8}}><input type='checkbox' checked={useOffline} onChange={(e)=>setUseOffline(e.target.checked)} /> Use offline Gemma (may download model)</label>
        </div>
        <footer style={{ marginTop: 16, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>
          Tip: A short sentence works best — the hypeman will pick the right mood.
        </footer>
      </div>
    </div>
  );
}
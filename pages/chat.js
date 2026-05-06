import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const OfflineHypeChat = dynamic(() => import("../components/OfflineHypeChat"), { ssr: false });

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState(null);
  const [mood, setMood] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [lastSentText, setLastSentText] = useState("");
  const cardRef = useRef(null);
  
  const [useOffline, setUseOffline] = useState(false);

  const [memPool, setMemPool] = useState({});
  const [seenIds, setSeenIds] = useState(new Set());
  const [voiceHistory, setVoiceHistory] = useState([]);
  const [affirmationCount, setAffirmationCount] = useState(0);

  const moodRef = useRef(mood);
  const memPoolRef = useRef(memPool);

  useEffect(() => { moodRef.current = mood; }, [mood]);
  useEffect(() => { memPoolRef.current = memPool; }, [memPool]);

  // Load static database on mount
  useEffect(() => {
    fetch("/data/affirmations.json")
      .then(res => res.json())
      .then(data => {
        setMemPool(data);
        const pool = data["neutral"] || [];
        if (pool.length > 0) {
          const first = pool[Math.floor(Math.random() * pool.length)];
          setSeenIds(new Set([first.id]));
          setReply(first.text);
          setAffirmationCount(1);
          setVoiceHistory([first.voice]);
        }
      })
      .catch(err => console.error("Database load error:", err));
  }, []);

  // Background Heartbeat Engine
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentMood = moodRef.current;
      const currentPool = memPoolRef.current[currentMood] || memPoolRef.current["neutral"];
      if (!currentPool || currentPool.length === 0) return;

      const sampleCards = currentPool.slice(0, 4);

      try {
        const res = await fetch("/api/affirmations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: currentMood, sampleCards })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.cards && data.cards.length > 0) {
            const dynamicCards = data.cards.map((c, i) => ({
              ...c,
              id: `DYN-${Date.now()}-${i}`
            }));

            // Silently append to pool
            setMemPool(prev => {
              const updated = { ...prev };
              if (!updated[currentMood]) updated[currentMood] = [];
              updated[currentMood] = [...updated[currentMood], ...dynamicCards];
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Background Engine Sync Error:", err);
      }
    }, 210000); // 3.5 minutes (doesn't trigger loading overlays)

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ravens-toggle", { detail: useOffline }));
    return () => {
        window.dispatchEvent(new CustomEvent("ravens-toggle", { detail: false }));
    };
  }, [useOffline]);

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

  function isEmojiOnly(str) {
    if (!str) return false;
    if (/[A-Za-z0-9]/.test(str)) return false;
    if (/\p{Letter}/u.test(str)) return false;
    return /\S/.test(str);
  }

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
  }, [mood]);

  const selectNextAffirmation = (targetMood) => {
    const pool = memPool[targetMood] || memPool["neutral"] || [];
    const available = pool.filter(c => !seenIds.has(c.id));

    if (available.length === 0) {
      return "That’s all I’ve got for tonight. Come back tomorrow.";
    }

    const nextCount = affirmationCount + 1;
    let chosen = null;

    // Asif Drop purely on the 8th count
    if (nextCount % 8 === 0) {
      const asifDrops = available.filter(c => c.voice === "asif_drop");
      if (asifDrops.length > 0) {
        chosen = asifDrops[Math.floor(Math.random() * asifDrops.length)];
      }
    }

    // Normal rotation unpredictability - ensure no back-to-back same voice
    if (!chosen) {
      let forbiddenVoice = voiceHistory.length > 0 ? voiceHistory[voiceHistory.length - 1] : null;
      let candidates = available.filter(c => c.voice !== forbiddenVoice && c.voice !== "asif_drop");
      
      // Fallbacks if filtered too tightly
      if (candidates.length === 0) candidates = available.filter(c => c.voice !== "asif_drop");
      if (candidates.length === 0) candidates = available;

      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    }

    setSeenIds(prev => new Set(prev).add(chosen.id));
    setAffirmationCount(nextCount);
    setVoiceHistory(prev => [...prev, chosen.voice].slice(-5));

    return chosen.text;
  };

  const handleSend = (e) => {
    e && e.preventDefault();
    const text = input.trim();
    if (!text) { setReply("say something my love"); return; }
    if (isEmojiOnly(text)) { setReply("Sorry?"); setInput(""); return; }
    if (text === lastSentText) { setReply("say something my love"); setInput(""); return; }

    const newMood = detectMoodLocal(text);
    setLastSentText(text);
    setInput("");
    setMood(newMood);
    
    const ans = selectNextAffirmation(newMood);
    setReply(ans);

    if (cardRef.current) {
      cardRef.current.animate([{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0px)", opacity: 1 }], { duration: 420 });
    }
  };

  const handleAnother = () => {
    const targetMood = lastSentText ? detectMoodLocal(lastSentText) : mood;
    setMood(targetMood);
    const ans = selectNextAffirmation(targetMood);
    setReply(ans);

    if (cardRef.current) {
      cardRef.current.animate([{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0px)", opacity: 1 }], { duration: 420 });
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {useOffline ? <OfflineHypeChat personaName={"Ayesha"} /> : null}

      <div style={{ width: "100%", maxWidth: 920 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>Daily Affirmations</h1>
            <div style={{ color: "rgba(0,0,0,0.6)", fontSize: 13 }}>For my baby — love, comfort, and endless hype.</div>
          </div>
          <button onClick={handleAnother} disabled={loading} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.18)", color: "#000" }}>Another one</button>
        </header>

        <main ref={cardRef} style={{ background: "rgba(255,255,255,0.94)", borderRadius: 16, padding: 30, minHeight: 240, boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
          {!reply ? <div style={{ textAlign: "center", color: "#333" }}>Hypeman is waking up…</div> : 
            <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(18px, 2.2vw, 22px)", textAlign: "center", color: "#111", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>{reply}</div>
          }
          <div style={{ marginTop: 12, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>Mood: <strong style={{ textTransform: "capitalize" }}>{mood}</strong></div>
        </main>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <input value={input} onChange={(e) => { setInput(e.target.value); setMood(detectMoodLocal(e.target.value)); }} placeholder="Type how you are feeling..." style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }} disabled={loading} />
          <button type="submit" disabled={loading} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "#b21b61", color: "#fff", fontWeight: 700 }}>Send</button>
        </form>

        <div style={{ textAlign: "center", marginTop: 40 }}>
           <button onClick={() => setUseOffline(true)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "10px 20px", opacity: 0.85, transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
             <img src="/ravens-star.png" alt="Ravens" style={{ width: "32px", height: "32px", objectFit: "contain", display: "block" }} />
             <span style={{ fontSize: "15px", fontWeight: 500, color: "#444", fontFamily: "Inter, sans-serif" }}>Switch to Ravens Protocol</span>
           </button>
        </div>
        <footer style={{ marginTop: 24, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>Tip: A short sentence works best.</footer>
      </div>
    </div>
  );
}

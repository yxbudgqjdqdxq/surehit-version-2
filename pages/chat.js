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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Playfair Display', serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lato:ital,wght@0,300;0,400;1,300&family=Great+Vibes&display=swap');
        
        .pinterest-btn {
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(10px);
          color: #4a3b3e;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .pinterest-btn:hover {
          background: rgba(255,255,255,0.9);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .primary-btn {
          padding: 12px 24px;
          border-radius: 30px;
          border: none;
          background: #d99aa9;
          color: white;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(217, 154, 169, 0.3);
        }
        .primary-btn:hover {
          background: #c58596;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(217, 154, 169, 0.4);
        }
        .soft-input {
          flex: 1;
          padding: 14px 20px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05);
          background: rgba(255,255,255,0.7);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: #4a3b3e;
          transition: all 0.3s ease;
          outline: none;
        }
        .soft-input:focus {
          background: rgba(255,255,255,0.95);
          border-color: rgba(217, 154, 169, 0.5);
          box-shadow: 0 0 0 3px rgba(217, 154, 169, 0.1);
        }
        .aesthetic-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.8);
          padding: 40px;
          min-height: 280px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .aesthetic-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }
      `}</style>
      {useOffline ? <OfflineHypeChat personaName={"Ayesha"} /> : null}

      <div style={{ width: "100%", maxWidth: 800, position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h1 style={{ margin: 0, fontWeight: 500, fontSize: "2.5rem", color: "#3a2e31", letterSpacing: "-0.5px" }}>Daily Affirmations</h1>
            <div style={{ color: "#7a6b6e", fontFamily: "'Great Vibes', cursive", fontSize: "1.4rem", marginTop: "-4px" }}>
              words I'd whisper to you if I were right there.
            </div>
          </div>
          <button onClick={handleAnother} disabled={loading} className="pinterest-btn">
            Another one
          </button>
        </header>

        <main ref={cardRef} className="aesthetic-card">
          {!reply ? <div style={{ textAlign: "center", color: "#8a7a7e", fontFamily: "'Lato', sans-serif" }}>gathering my thoughts...</div> : 
            <div style={{ fontSize: "clamp(20px, 2.5vw, 26px)", textAlign: "center", color: "#3a2e31", lineHeight: "1.5", whiteSpace: "pre-wrap", fontWeight: 400, fontStyle: "italic" }}>
              "{reply}"
            </div>
          }
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: "#9a8a8e", fontFamily: "'Lato', sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Mood: <strong style={{ fontWeight: 600, color: "#d99aa9" }}>{mood}</strong>
          </div>
        </main>

        <form onSubmit={handleSend} style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <input 
            value={input} 
            onChange={(e) => { setInput(e.target.value); setMood(detectMoodLocal(e.target.value)); }} 
            placeholder="Tell me what's on your mind..." 
            className="soft-input"
            disabled={loading} 
          />
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 40 }}>
           <button onClick={() => setUseOffline(true)} style={{ background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "10px 20px", transition: "transform 0.3s ease", opacity: 0.7 }} onMouseOver={(e) => {e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.opacity = "1"}} onMouseOut={(e) => {e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "0.7"}}>
             <span style={{ fontSize: "12px", fontWeight: 300, color: "#5a4a4e", fontFamily: "'DM Sans', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>Enter Shin-gan Sō-ai</span>
           </button>
        </div>
      </div>
    </div>
  );
}

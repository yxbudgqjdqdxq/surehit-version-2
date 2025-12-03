// pages/chat.js
import React, { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';

// Dynamic import for the Ravens Protocol overlay
const OfflineHypeChat = dynamic(() => import('../components/OfflineHypeChat'), { ssr: false });

// --- 🎵 PLAYLIST CONFIGURATION ---
const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3"
];

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
  
  // Controls the Ravens Protocol UI
  const [useOffline, setUseOffline] = useState(false);

  // --- MUSIC PLAYER STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // Controls the Toggle (Arrow)
  const audioRef = useRef(null);

  // --- MUSIC LOGIC (Auto-Start) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5; 
      // Try to play immediately
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // If browser blocks auto-play, wait for first click
          const enableAudio = () => {
            audio.play();
            setIsPlaying(true);
            window.removeEventListener('click', enableAudio);
          };
          window.addEventListener('click', enableAudio);
        });
      }
    }
  }, []);

  const handleSongEnd = () => {
    nextSong();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= PLAYLIST.length) nextIndex = 0; 
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true); 
  };

  const prevSong = () => {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = PLAYLIST.length - 1;
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex]);


  // --- MOOD DETECTION ---
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
    (async () => {
      const initial = await callApi("");
      if (initial) setReply(initial);
    })();
  }, []);

  const handleSend = async (e) => {
    e && e.preventDefault();
    setError(null);
    const text = input.trim();

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

    if (isEmojiOnly(text)) {
      setReply("Sorry?");
      setInput("");
      return;
    }

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
      
      {/* 1. RAVENS OVERLAY */}
      {useOffline ? <OfflineHypeChat personaName={'Ayesha'} /> : null}

      {/* 2. AUDIO LOGIC */}
      <audio 
        ref={audioRef} 
        src={PLAYLIST[currentSongIndex]} 
        onEnded={handleSongEnd}
      />

      {/* 3. VIBE PLAYER (Bottom Right) */}
      <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px'
      }}>
          
          {/* EXPANDED PLAYER PANEL */}
          {isPlayerOpen && (
              <div className="animate-in fade-in slide-in-from-bottom-5" style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  width: '200px',
                  border: '1px solid rgba(255,255,255,0.5)',
                  marginBottom: '8px'
              }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.5px', textTransform:'uppercase' }}>
                      Vibe • Track {currentSongIndex + 1}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={prevSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#333"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                      </button>

                      <button onClick={togglePlay} style={{ 
                          width: '44px', height: '44px', 
                          background: '#333', borderRadius: '50%', 
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}>
                          {isPlaying ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                          ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          )}
                      </button>

                      <button onClick={nextSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#333"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                      </button>
                  </div>
              </div>
          )}

          {/* TOGGLE BUTTON */}
          <button 
            onClick={() => setIsPlayerOpen(!isPlayerOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlayerOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            ) : (
                <div style={{ position: 'relative' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isPlaying ? "#b21b61" : "#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                    {isPlaying && (
                        <span style={{
                            position: 'absolute', top: -2, right: -2, width: 8, height: 8,
                            background: '#b21b61', borderRadius: '50%', border: '1px solid white'
                        }} />
                    )}
                </div>
            )}
          </button>
      </div>

      <div style={{ width: "100%", maxWidth: 920 }}>
        
        {/* HEADER */}
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

        {/* MAIN CARD */}
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

        {/* INPUT FORM */}
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

        {/* --- 4. THE CLEAN RAVENS BUTTON (Replaces Checkbox) --- */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
           <button
             onClick={() => setUseOffline(true)}
             style={{
               background: "transparent",
               border: "none",
               cursor: "pointer",
               display: "inline-flex",
               alignItems: "center",
               justifyContent: "center",
               gap: "10px", 
               padding: "10px 20px",
               opacity: 0.85, 
               transition: "transform 0.2s, opacity 0.2s"
             }}
             onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.02)';
             }}
             onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.transform = 'scale(1)';
             }}
           >
             <img 
                src="/ravens-star.png" 
                alt="Ravens" 
                style={{ 
                    width: "32px", 
                    height: "32px", 
                    objectFit: "contain",
                    display: "block"
                }} 
             />
             <span style={{ 
                fontSize: "15px", 
                fontWeight: 500,
                color: "#444", 
                fontFamily: "Inter, sans-serif", 
                letterSpacing: "0.3px"
             }}>
               Switch to Ravens Protocol
             </span>
           </button>
        </div>

        <footer style={{ marginTop: 24, textAlign: "center", color: "rgba(0,0,0,0.45)" }}>
          Tip: A short sentence works best — the hypeman will pick the right mood.
        </footer>
      </div>
    </div>
  );
}

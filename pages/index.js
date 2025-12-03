// pages/index.js
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// --- 🎵 PLAYLIST CONFIGURATION ---
const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3"
];

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const router = useRouter();

  // --- MUSIC PLAYER STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const audioRef = useRef(null);

  // --- MUSIC LOGIC (Auto-Start) ---
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {
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

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };
  const nextSong = () => {
    let next = currentSongIndex + 1;
    if (next >= PLAYLIST.length) next = 0;
    setCurrentSongIndex(next);
    setIsPlaying(true);
  };
  const prevSong = () => {
    let prev = currentSongIndex - 1;
    if (prev < 0) prev = PLAYLIST.length - 1;
    setCurrentSongIndex(prev);
    setIsPlaying(true);
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) audioRef.current.play();
    }
  }, [currentSongIndex]);


  function handleMainClick() {
    setEntered(true);
  }

  function openSecret() {
    setPw("");
    setPwError("");
    setShowModal(true);
  }

  function submitPw(e) {
    e.preventDefault();
    if (pw.trim() === "14344") {
      setShowModal(false);
      router.push("/vault?auth=1");
    } else {
      setPwError("Wrong password. This covers something private — try again.");
    }
  }

  return (
    <main className="main-container">
      
      {/* --- AUDIO LOGIC --- */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={nextSong} />

      {/* --- VIBE PLAYER (Bottom Right) --- */}
      <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'
      }}>
          {isPlayerOpen && (
              <div className="animate-in fade-in slide-in-from-bottom-5" style={{
                  background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)',
                  padding: '16px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  width: '200px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '8px'
              }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.5px', textTransform:'uppercase' }}>
                      Vibe • Track {currentSongIndex + 1}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={prevSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#333"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                      </button>
                      <button onClick={togglePlay} style={{ 
                          width: '44px', height: '44px', background: '#333', borderRadius: '50%', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}>
                          {isPlaying ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                      </button>
                      <button onClick={nextSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#333"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                      </button>
                  </div>
              </div>
          )}
          <button onClick={() => setIsPlayerOpen(!isPlayerOpen)} style={{
              background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '50%',
              width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            {isPlayerOpen ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg> : <div style={{ position: 'relative' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isPlaying ? "#b21b61" : "#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>{isPlaying && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#b21b61', borderRadius: '50%', border: '1px solid white' }} />}</div>}
          </button>
      </div>

      {!entered ? (
        <button className="landing-btn" onClick={handleMainClick}>
          I Missed You Bubu
        </button>
      ) : (
        <div className="choices" role="navigation" aria-label="Main choices">
          <Link href="/paragraphs" legacyBehavior>
            <a className="choice-btn">Feeling Moody Today?</a>
          </Link>

          <Link href="/chat" legacyBehavior>
            <a className="choice-btn">Daily Affirmations</a>
          </Link>

          {/* Secret vault button */}
          <button
            onClick={openSecret}
            style={{
              padding: "12px 28px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(90deg,#ff8ab1,#ff5a9e)",
              color: "white",
              fontWeight: 900,
              boxShadow: "0 14px 36px rgba(255,90,157,0.14)",
              cursor: "pointer"
            }}
          >
            click this when you are super duper sad
          </button>
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.34)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
        }}>
          <div style={{ width: "min(680px, 92%)", background: "#fff", padding: 22, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: 0 }}>Secret Vault</h3>
            <p style={{ color: "rgba(0,0,0,0.6)" }}>Enter the password to reveal a private message.</p>

            <form onSubmit={submitPw} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                autoFocus
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <button style={{ padding: "10px 12px", borderRadius: 8, border: "none", background: "#b21b61", color: "#fff" }}>Open</button>
            </form>

            {pwError && <div style={{ color: "crimson", marginTop: 10 }}>{pwError}</div>}

            <div style={{ marginTop: 14, textAlign: "right" }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

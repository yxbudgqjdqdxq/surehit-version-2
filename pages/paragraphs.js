// pages/paragraphs.js
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import paragraphs from '../public/data/paragraphs.json'

// --- 🎵 PLAYLIST CONFIGURATION ---
const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3"
];

export default function Paragraphs() {
  
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


  return (
    <main className="paragraphs-page">
      <h2 className="page-title">Pick a Thought</h2>

      {/* --- AUDIO LOGIC --- */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={nextSong} />

      {/* --- VIBE PLAYER (Bottom Right) --- */}
      <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
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

      <div className="paragraph-grid">
        {paragraphs.map((p, i) => (
          <Link key={p.id ?? i} href={`/paragraphs/${i}`} legacyBehavior>
            <a className="para-button" aria-label={p.title}>
              <div className="para-left">
                <div className="para-tag">#{(i + 1).toString().padStart(2, '0')}</div>
                <div className="para-title">{p.title}</div>
              </div>
              <div className="para-arrow">→</div>
            </a>
          </Link>
        ))}
      </div>
    </main>
  )
}

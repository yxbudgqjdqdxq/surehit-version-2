// pages/_app.js
import { useState, useEffect, useRef } from 'react';
import '../styles/globals.css'; 

// --- 🎵 GLOBAL PLAYLIST ---
const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3"
];

export default function App({ Component, pageProps }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isRavensActive, setIsRavensActive] = useState(false);
  const audioRef = useRef(null);

  // --- LISTEN FOR RAVENS PROTOCOL SIGNAL ---
  useEffect(() => {
    const handleRavens = (e) => {
      const active = e.detail;
      setIsRavensActive(active);

      if (active && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!active && audioRef.current && !isPlaying) {
         // Auto-resume when closed
         audioRef.current.play().catch(() => {});
         setIsPlaying(true);
      }
    };

    window.addEventListener('ravens-toggle', handleRavens);
    return () => window.removeEventListener('ravens-toggle', handleRavens);
  }, [isPlaying]);

  // --- GLOBAL AUTO-START ---
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {
          const enableAudio = () => {
             if (!isRavensActive) {
                audio.play();
                setIsPlaying(true);
             }
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
      if (isPlaying && !isRavensActive) audioRef.current.play();
    }
  }, [currentSongIndex]);

  return (
    <>
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={nextSong} />
      
      <Component {...pageProps} />

      {!isRavensActive && (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px',
            fontFamily: 'sans-serif' 
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
                        <button onClick={prevSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>⏮</button>
                        <button onClick={togglePlay} style={{ 
                            width: '44px', height: '44px', background: '#333', borderRadius: '50%', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                        <button onClick={nextSong} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>⏭</button>
                    </div>
                </div>
            )}
            <button onClick={() => setIsPlayerOpen(!isPlayerOpen)} style={{
                background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '50%',
                width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                {isPlayerOpen ? "⬇" : "🎵"}
            </button>
        </div>
      )}
    </>
  );
}

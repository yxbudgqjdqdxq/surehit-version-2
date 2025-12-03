// pages/_app.js
import { useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

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

  // Handle Ravens Protocol Silence
  useEffect(() => {
    const handleRavens = (e) => {
      const active = e.detail;
      setIsRavensActive(active);
      if (active && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('ravens-toggle', handleRavens);
    return () => window.removeEventListener('ravens-toggle', handleRavens);
  }, []);

  // Simple Auto-Play
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {}); // catch creates a safe fail
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

  // Song change effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentSongIndex]);

  return (
    <>
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={nextSong} />
      <Component {...pageProps} />
      
      {!isRavensActive && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
           {isPlayerOpen && (
             <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '12px', borderRadius: '16px', border:'1px solid #ddd', display:'flex', gap:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' }}>
                <button onClick={prevSong} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'18px' }}>⏮</button>
                <button onClick={togglePlay} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'18px' }}>{isPlaying ? "⏸" : "▶"}</button>
                <button onClick={nextSong} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'18px' }}>⏭</button>
             </div>
           )}
           <button onClick={() => setIsPlayerOpen(!isPlayerOpen)} style={{ width:'48px', height:'48px', borderRadius:'50%', border:'none', background:'white', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
             🎵
           </button>
        </div>
      )}
    </>
  );
}

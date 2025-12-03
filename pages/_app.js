// pages/_app.js
import { useState, useEffect, useRef } from 'react';
import Head from "next/head";
import Script from "next/script";
import AnimatedBackground from "../components/AnimatedBackground";
import Header from "../components/Header";
import "../styles/globals.css";

// --- 🎵 GLOBAL PLAYLIST ---
const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3"
];

const GA_MEASUREMENT_ID = "G-VFD4DC3SSE";

export default function MyApp({ Component, pageProps }) {
  // --- MUSIC STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isRavensActive, setIsRavensActive] = useState(false);
  const audioRef = useRef(null);

  const faviconSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
      <path fill='white' d='M12 21s-7.33-4.94-9.2-8.02C.8 9.9 3.2 6.5 6.2 6.5c1.7 0 2.68 1.1 3.3 2.05.33.52.62 1.02 1.5 1.02.88 0 1.17-.5 1.5-1.02.62-.95 1.6-2.05 3.3-2.05 3 0 5.4 3.4 3.4 6.48C19.33 16.06 12 21 12 21z'/>
    </svg>
  `);

  // --- 1. LISTEN FOR RAVENS PROTOCOL SIGNALS ---
  useEffect(() => {
    const handleRavens = (e) => {
      const active = e.detail;
      setIsRavensActive(active);
      if (active && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!active && audioRef.current && !isPlaying) {
         // Optional: Resume on close
         audioRef.current.play().catch(() => {});
         setIsPlaying(true);
      }
    };
    window.addEventListener('ravens-toggle', handleRavens);
    return () => window.removeEventListener('ravens-toggle', handleRavens);
  }, [isPlaying]);

  // --- 2. GLOBAL AUTO-START MUSIC ---
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {
          // Browser blocked auto-play? Wait for interaction
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

  // --- CONTROLS ---
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
      <Head>
        <title>🤍 ilovemybubu.vercel.app</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={`data:image/svg+xml;utf8,${faviconSvg}`} />
      </Head>

      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
          `,
        }}
      />

      {/* GLOBAL AUDIO ELEMENT */}
      <audio ref={audioRef} src={PLAYLIST[currentSongIndex]} onEnded={nextSong} />

      {/* Mount the animated background once at the app level */}
      <AnimatedBackground />

      {/* Add the Header component here */}
      <Header />

      <div className="site-root">
        <Component {...pageProps} />
      </div>

      {/* GLOBAL VIBE PLAYER (Hidden if Ravens is Active) */}
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

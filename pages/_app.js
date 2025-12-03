// pages/_app.js
import { useState, useEffect, useRef } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import Header from "../components/Header";
import "../styles/globals.css";

const PLAYLIST = [
  "/song1.mp3",
  "/song2.mp3",
  "/song3.mp3",
  "/song4.mp3",
];

export default function App({ Component, pageProps }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isRavensActive, setIsRavensActive] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    // Ensure audio element exists and update source when song index changes
    if (!audioRef.current) {
      audioRef.current = new Audio(PLAYLIST[currentSongIndex]);
      audioRef.current.loop = false;
      audioRef.current.preload = "auto";
      audioRef.current.addEventListener("ended", () => {
        // autoplay next when a song ends
        setCurrentSongIndex((idx) => (idx + 1) % PLAYLIST.length);
      });
    } else {
      audioRef.current.src = PLAYLIST[currentSongIndex];
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    // cleanup if component unmounts
    return () => {
      // keep audio across navigation depending on your needs; here we pause
      // to avoid dangling audio in dev environment
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  function nextSong() {
    setCurrentSongIndex((idx) => (idx + 1) % PLAYLIST.length);
    setIsPlaying(true);
  }

  function prevSong() {
    setCurrentSongIndex((idx) => (idx - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  }

  return (
    <>
      {/* Animated background mounted at app level */}
      <AnimatedBackground />

      {/* Header */}
      <Header />

      {/* Simple music player overlay */}
      <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 9999 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,0,0,0.55)",
            padding: "8px 10px",
            borderRadius: 12,
            color: "white",
            boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          {isPlayerOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={prevSong}
                aria-label="Previous"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "white",
                }}
              >
                ⏮
              </button>

              <button
                onClick={togglePlay}
                aria-label="Play/Pause"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "white",
                }}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                onClick={nextSong}
                aria-label="Next"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "white",
                }}
              >
                ⏭
              </button>

              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {PLAYLIST[currentSongIndex].replace("/", "")}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsPlayerOpen((v) => !v)}
            aria-label="Toggle player"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background: "linear-gradient(135deg,#ff758c,#ff7eb3)",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            🎵
          </button>

          {/* Optional Raven's toggle (placeholder) */}
          <button
            onClick={() => setIsRavensActive((v) => !v)}
            aria-label="Toggle Ravens"
            style={{
              marginLeft: 6,
              border: "none",
              background: isRavensActive ? "#ffd1e8" : "transparent",
              borderRadius: 8,
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            🧠
          </button>
        </div>
      </div>

      <div className="site-root" style={{ minHeight: "100vh" }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

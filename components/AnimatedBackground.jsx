// components/AnimatedBackground.jsx
import React, { useEffect, useState } from "react";

/**
 * AnimatedBackground (Hydration Fixed)
 *
 * - FIX: Moves random generation inside useEffect to prevent Server/Client mismatch.
 * - Result: No more red console errors, smoother startup.
 */

const HEART_COUNT = 28; 
const DEBUG = false;    

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
  // 1. Initialize with EMPTY state to ensure Server & Client match exactly on first paint.
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (DEBUG) console.info("AnimatedBackground mounted (DEBUG mode)");

    // 2. Generate random values ONLY after the component has mounted in the browser.
    const generatedHearts = new Array(HEART_COUNT).fill(0).map((_, i) => {
      const top = Math.round(rand(4, 92));          
      const size = Math.round(rand(24, 56));       
      const duration = Number(rand(10, 26).toFixed(2)); 
      const delay = Number(rand(-12, 4).toFixed(2));    
      const rotate = Math.round(rand(-24, 24));    
      const floatAmt = Number(rand(6, 28).toFixed(2));  
      
      // Select random colors here
      const colorA = ["#ff7aa8", "#ff8fb3", "#ff6fa1", "#ff9ed1"][Math.floor(rand(0,4))];
      const colorB = ["#ffd1e8", "#ffc0de", "#ffd8f0", "#ffc8e6"][Math.floor(rand(0,4))];
      
      return { id: i, top, size, duration, delay, rotate, floatAmt, colorA, colorB };
    });

    setHearts(generatedHearts);
  }, []);

  const heartsZ = DEBUG ? 999999 : 1;

  return (
    <div className="animated-bg" aria-hidden>
      {/* Static blobs are safe to render immediately */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      <div
        className="hearts-container"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "visible",
        }}
      >
        <style>{`
          @keyframes heartFloat {
            0%   { transform: translateX(-28vw) translateY(0) rotate(var(--rot)); opacity: 1; }
            25%  { transform: translateX(18vw) translateY(calc(var(--float) * -0.6)) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
            50%  { transform: translateX(48vw) translateY(calc(var(--float) * 1)) rotate(calc(var(--rot) + 12deg)); opacity: 1; }
            75%  { transform: translateX(84vw) translateY(calc(var(--float) * -0.5)) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
            100% { transform: translateX(128vw) translateY(0) rotate(var(--rot)); opacity: 1; }
          }
          .hearts-container svg {
            display: block;
            will-change: transform, opacity;
            filter: drop-shadow(0 10px 22px rgba(178,27,97,0.12));
            backface-visibility: hidden;
          }
        `}</style>

        {/* 3. Render hearts only after hydration is complete */}
        {hearts.map((h) => (
          <svg
            key={h.id}
            id={`HEART_SVG_${h.id}`}
            viewBox="0 0 24 24"
            width={h.size}
            height={h.size}
            style={{
              position: "absolute",
              top: `${h.top}%`,
              left: `-28vw`,
              transform: `rotate(${h.rotate}deg)`,
              animation: `heartFloat ${h.duration}s linear ${h.delay}s infinite`,
              "--rot": `${h.rotate}deg`,
              "--float": `${h.floatAmt}px`,
              opacity: 1,
            }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            role="img"
          >
            <defs>
              <linearGradient id={`heartGrad${h.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={h.colorA} />
                <stop offset="100%" stopColor={h.colorB} />
              </linearGradient>
            </defs>

            <path
              d="M12 21s-7.33-4.94-9.2-8.02C0.8 9.9 3.2 6.5 6.2 6.5c1.7 0 2.68 1.1 3.3 2.05.33.52.62 1.02 1.5 1.02.88 0 1.17-.5 1.5-1.02.62-.95 1.6-2.05 3.3-2.05 3 0 5.4 3.4 3.4 6.48C19.33 16.06 12 21 12 21z"
              fill={`url(#heartGrad${h.id})`}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

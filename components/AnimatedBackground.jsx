
// components/AnimatedBackground.jsx
import React, { useEffect } from "react";

/**
 * Robust AnimatedBackground using inline <svg> hearts.
 * - Debug mode (debug=true) uses very high z-index so hearts cannot be covered.
 * - Production mode (debug=false) sets zIndex to 1 (above blobs, under site-root).
 *
 * Replace the existing file with this file, push to main, let Vercel redeploy,
 * then hard-refresh the site and inspect DOM for "ANIM_HEART_SVG_" elements.
 */

const HEART_COUNT = 28; // density - increase if you want more
const DEBUG = false;     // <-- set to false after verification

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
  useEffect(() => {
    console.info("AnimatedBackground mounted - DEBUG:", DEBUG);
  }, []);

  const hearts = new Array(HEART_COUNT).fill(0).map((_, i) => ({
    id: i,
    top: Math.round(rand(3, 92)),
    size: Math.round(rand(28, 66)),
    duration: Number(rand(10, 26).toFixed(2)),
    delay: Number(rand(-12, 2).toFixed(2)),
    rotate: Math.round(rand(-18, 18)),
    floatAmt: Number(rand(-6, 8).toFixed(2)),
    // colors: choose a nice gradient mix for variety
    colorA: ["#ff7aa8", "#ff8fb3", "#ff6fa1", "#ff9ed1"][Math.floor(rand(0,4))],
    colorB: ["#ff9ad6", "#ffc0de", "#ffd1f0", "#ffc8e6"][Math.floor(rand(0,4))]
  }));

  // zIndex: if DEBUG true, put VERY high z-index so these cannot be hidden;
  // otherwise put 1 (blobs are 0 and site-root is 2 per your CSS).
  const heartsZ = DEBUG ? 999999 : 1;

  return (
    <div className="animated-bg" aria-hidden>
      {/* keep original blurred blobs and noise so site depth is preserved */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts container */}
      <div
        className="hearts-container"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: heartsZ,
          overflow: "visible"
        }}
      >
        <style>{`
          /* smooth left-to-right path with a gentle float */
          @keyframes heartFloat {
            0%   { transform: translateX(-28vw) translateY(0) rotate(var(--rot)); opacity: 1; }
            20%  { transform: translateX(12vw) translateY(calc(var(--float) * -0.6px)) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
            45%  { transform: translateX(48vw) translateY(calc(var(--float) * 1px)) rotate(calc(var(--rot) + 12deg)); opacity: 1; }
            70%  { transform: translateX(84vw) translateY(calc(var(--float) * -0.6px)) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
            100% { transform: translateX(128vw) translateY(0) rotate(var(--rot)); opacity: 1; }
          }

          /* make sure inline svgs don't inherit weird CSS */
          .hearts-container svg {
            display: block;
            will-change: transform, opacity;
            filter: drop-shadow(0 10px 22px rgba(178,27,97,0.12));
          }
        `}</style>

        {hearts.map(h => (
          <svg
            key={h.id}
            id={`ANIM_HEART_SVG_${h.id}`}
            viewBox="0 0 24 24"
            width={h.size}
            height={h.size}
            style={{
              position: "absolute",
              top: `${h.top}%`,
              left: `-28vw`,
              transform: `rotate(${h.rotate}deg)`,
              animation: `heartFloat ${h.duration}s linear ${h.delay}s infinite`,
              // CSS variables used by keyframes for each heart
              "--rot": `${h.rotate}deg`,
              "--float": `${h.floatAmt}`,
              opacity: 1,
            }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            role="img"
          >
            <defs>
              <linearGradient id={`g${h.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={h.colorA}/>
                <stop offset="100%" stopColor={h.colorB}/>
              </linearGradient>
            </defs>

            {/* Pixel-heart constructed with rectangles so it looks pixel-art */}
            <g transform="translate(2 2)">
              <rect x="2" y="2" width="3" height="3" fill={`url(#g${h.id})`} rx="0.4" />
              <rect x="5" y="2" width="3" height="3" fill={`url(#g${h.id})`} rx="0.4" />
              <rect x="8" y="3" width="3" height="3" fill={`url(#g${h.id})`} rx="0.4" />
              <rect x="2" y="5" width="9" height="3" fill={`url(#g${h.id})`} rx="0.4" />
              <rect x="3" y="8" width="7" height="3" fill={`url(#g${h.id})`} rx="0.4" />
              <rect x="4" y="11" width="5" height="3" fill={`url(#g${h.id})`} rx="0.4" />
            </g>
          </svg>
        ))}
      </div>
    </div>
  );
}
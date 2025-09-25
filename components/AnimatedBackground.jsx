
// components/AnimatedBackground.jsx
import React, { useEffect } from "react";

/**
 * AnimatedBackground (emoji-heart style)
 *
 * - Smooth heart SVG (not pixel-squares)
 * - Multiple hearts glide left -> right with subtle vertical "float"
 * - DEBUG toggle: set to true to forcibly put hearts on top for testing
 *
 * Usage: drop into /components and ensure your app imports <AnimatedBackground /> (you already have this).
 */

const HEART_COUNT = 28; // adjust density: lower = fewer hearts, higher = more
const DEBUG = false;    // set true to force very-high z-index for testing

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
  useEffect(() => {
    if (DEBUG) console.info("AnimatedBackground mounted (DEBUG mode)");
  }, []);

  const hearts = new Array(HEART_COUNT).fill(0).map((_, i) => {
    const top = Math.round(rand(4, 92));          // vertical position %
    const size = Math.round(rand(24, 56));       // pixel size
    const duration = Number(rand(10, 26).toFixed(2)); // seconds per loop
    const delay = Number(rand(-12, 4).toFixed(2));    // stagger start
    const rotate = Math.round(rand(-24, 24));    // rotation degrees
    const floatAmt = Number(rand(6, 28).toFixed(2));  // small vertical float amplitude (px)
    const colorA = ["#ff7aa8", "#ff8fb3", "#ff6fa1", "#ff9ed1"][Math.floor(rand(0,4))];
    const colorB = ["#ffd1e8", "#ffc0de", "#ffd8f0", "#ffc8e6"][Math.floor(rand(0,4))];
    return { id: i, top, size, duration, delay, rotate, floatAmt, colorA, colorB };
  });

  // zIndex: DEBUG uses a very high z-index so hearts can't be hidden during testing.
  const heartsZ = DEBUG ? 999999 : 1;

  return (
    <div className="animated-bg" aria-hidden>
      {/* keep your existing soft blobs for depth */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts layer: above blobs but below site-root (.site-root has z-index:2 in your CSS) */}
      <div
        className="hearts-container"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: heartsZ,
          overflow: "visible",
        }}
      >
        <style>{`
          /* smooth left-to-right path with gentle vertical float */
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
              // CSS variables for keyframes
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

            {/* Smooth heart path (emoji-style) */}
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
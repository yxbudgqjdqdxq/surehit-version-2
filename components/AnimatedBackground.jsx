
// components/AnimatedBackground.jsx
import React from "react";

/**
 * AnimatedBackground:
 * - keeps your soft blobs (like your globals.css expects)
 * - adds multiple small "pixel heart" SVGs that glide from left to right in an infinite loop
 *
 * This uses inline styles and internal <style> for keyframes so you don't need to change globals.css.
 */

const HEART_COUNT = 14; // adjust if you want more/less hearts

// tiny pixel-heart SVG (pink) encoded as data URI later
const pixelHeartSvg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
  <g fill='none' fill-rule='evenodd'>
    <rect width='24' height='24' fill='none'/>
    <g transform='translate(2 2)'>
      <rect x='2' y='2' width='3' height='3' fill='%23ff8fb3'/>
      <rect x='5' y='2' width='3' height='3' fill='%23ff8fb3'/>
      <rect x='8' y='3' width='3' height='3' fill='%23ff8fb3'/>
      <rect x='2' y='5' width='9' height='3' fill='%23ff8fb3'/>
      <rect x='3' y='8' width='7' height='3' fill='%23ff8fb3'/>
      <rect x='4' y='11' width='5' height='3' fill='%23ff8fb3'/>
    </g>
  </g>
</svg>
`;
const pixelHeartData = encodeURIComponent(pixelHeartSvg);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
  // generate heart items
  const hearts = new Array(HEART_COUNT).fill(0).map((_, i) => {
    const top = Math.round(rand(-6, 92)); // percent top
    const size = Math.round(rand(18, 56));
    const duration = rand(9, 24); // seconds
    const delay = rand(-8, 8); // seconds
    const opacity = Number(rand(0.14, 0.9).toFixed(2));
    const rotate = Math.round(rand(-8, 16));
    return { id: i, top, size, duration, delay, opacity, rotate };
  });

  return (
    <div className="animated-bg" aria-hidden>
      {/* preserve your blobs for original look */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <style>{`
          @keyframes heartMove {
            0% { transform: translateX(-28vw) translateZ(0) rotate(var(--rot)); opacity: var(--o); }
            50% { transform: translateX(42vw) translateZ(0) rotate(calc(var(--rot) + 8deg)); opacity: calc(var(--o) + 0.06); }
            100% { transform: translateX(110vw) translateZ(0) rotate(var(--rot)); opacity: var(--o); }
          }
        `}</style>

        {hearts.map(h => (
          <div
            key={h.id}
            style={{
              position: "absolute",
              top: `${h.top}%`,
              left: `-20vw`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              backgroundImage: `url("data:image/svg+xml;utf8,${pixelHeartData}")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              opacity: h.opacity,
              transform: `translateX(0) rotate(${h.rotate}deg)`,
              animation: `heartMove ${h.duration}s linear ${h.delay}s infinite`,
              zIndex: 0,
              filter: "drop-shadow(0 8px 18px rgba(178,27,97,0.06))"
            }}
          />
        ))}
      </div>
    </div>
  );
}
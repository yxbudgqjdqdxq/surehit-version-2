
// components/AnimatedBackground.jsx
import React from "react";

/**
 * AnimatedBackground (final)
 * - Pixel-heart SVG data-URI
 * - Hearts float across the screen, fully visible
 * - Hearts are above blobs (z-index:1) but behind main content (site-root z-index:2)
 */

const HEART_COUNT = 28; // adjust density (28 is lively but not spammy)

const pixelHeartSvg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
  <g fill='none' fill-rule='evenodd'>
    <rect width='24' height='24' fill='none'/>
    <g transform='translate(2 2)'>
      <rect x='2' y='2' width='3' height='3' fill='%23ff7aa8'/>
      <rect x='5' y='2' width='3' height='3' fill='%23ff7aa8'/>
      <rect x='8' y='3' width='3' height='3' fill='%23ff7aa8'/>
      <rect x='2' y='5' width='9' height='3' fill='%23ff7aa8'/>
      <rect x='3' y='8' width='7' height='3' fill='%23ff7aa8'/>
      <rect x='4' y='11' width='5' height='3' fill='%23ff7aa8'/>
    </g>
  </g>
</svg>
`;
const pixelHeartData = encodeURIComponent(pixelHeartSvg);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground() {
  const hearts = new Array(HEART_COUNT).fill(0).map((_, i) => {
    return {
      id: i,
      top: Math.round(rand(4, 92)),        // vertical placement in %
      size: Math.round(rand(26, 56)),      // px
      duration: rand(10, 26),              // seconds per loop
      delay: rand(-12, 2),                 // start stagger
      rotate: Math.round(rand(-18, 18)),   // rotation
      floatAmt: Number(rand(-3, 6).toFixed(2)) // slight vertical float
    };
  });

  return (
    <div className="animated-bg" aria-hidden>
      {/* existing soft blobs (kept for depth) */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts layer: above blobs but behind content */}
      <div
        className="hearts-container"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,           // IMPORTANT: above blob layer (0) but under site-root (2)
          overflow: "visible"
        }}
      >
        {/* lightweight keyframes tailored for smooth motion */}
        <style>{`
          @keyframes heartMove {
            0%   { transform: translateX(-24vw) translateY(0) rotate(var(--rot)); opacity: 1; }
            25%  { transform: translateX(18vw) translateY(calc(var(--float) * -0.6px)) rotate(calc(var(--rot) + 8deg)); opacity: 1; }
            50%  { transform: translateX(48vw) translateY(calc(var(--float) * 1px)) rotate(calc(var(--rot) + 12deg)); opacity: 1; }
            75%  { transform: translateX(80vw) translateY(calc(var(--float) * -0.6px)) rotate(calc(var(--rot) + 6deg)); opacity: 1; }
            100% { transform: translateX(120vw) translateY(0) rotate(var(--rot)); opacity: 1; }
          }
        `}</style>

        {hearts.map(h => (
          <div
            key={h.id}
            className="pixel-heart"
            style={{
              position: "absolute",
              top: `${h.top}%`,
              left: `-24vw`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              backgroundImage: `url("data:image/svg+xml;utf8,${pixelHeartData}")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              transform: `rotate(${h.rotate}deg)`,
              animation: `heartMove ${h.duration}s linear ${h.delay}s infinite`,
              // CSS variables used by keyframes
              "--rot": `${h.rotate}deg`,
              "--float": `${h.floatAmt}`,
              opacity: 1,
              willChange: "transform, opacity"
            }}
          />
        ))}
      </div>
    </div>
  );
}
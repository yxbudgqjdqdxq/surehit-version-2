
// components/AnimatedBackground.jsx
import React from "react";

const HEART_COUNT = 14;

// tiny pixel-heart SVG encoded for inline use
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
  const hearts = new Array(HEART_COUNT).fill(0).map((_, i) => {
    return {
      id: i,
      top: Math.round(rand(5, 90)),       // % from top
      size: Math.round(rand(20, 48)),     // px size
      duration: rand(12, 26),             // seconds per loop
      delay: rand(-10, 0),                // stagger start
      opacity: Number(rand(0.3, 0.9).toFixed(2)),
      rotate: Math.round(rand(-12, 12)),  // rotation
    };
  });

  return (
    <div className="animated-bg" aria-hidden>
      {/* keep your soft blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* pixel hearts layer */}
      <div className="hearts-container">
        <style>{`
          @keyframes heartMove {
            0%   { transform: translateX(-20vw) rotate(var(--rot)); opacity: var(--o); }
            50%  { opacity: calc(var(--o) + 0.1); }
            100% { transform: translateX(110vw) rotate(var(--rot)); opacity: var(--o); }
          }
        `}</style>

        {hearts.map((h) => (
          <div
            key={h.id}
            className="pixel-heart"
            style={{
              top: `${h.top}%`,
              left: `-20vw`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              backgroundImage: `url("data:image/svg+xml;utf8,${pixelHeartData}")`,
              opacity: h.opacity,
              transform: `rotate(${h.rotate}deg)`,
              animation: `heartMove ${h.duration}s linear ${h.delay}s infinite`,
              "--rot": `${h.rotate}deg`,
              "--o": h.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
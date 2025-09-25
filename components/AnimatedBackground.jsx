
// components/AnimatedBackground.jsx
import React, { useMemo } from "react";

/**
 * AnimatedBackground
 * - soft blobs (CSS in globals.css)
 * - floating pixel hearts (SVG data-URI) that glide left→right
 *
 * This is SSR-safe (only precomputes positions).
 */

const HEART_COUNT = 14;

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

export default function AnimatedBackground({ heartCount = HEART_COUNT }) {
  const hearts = useMemo(() => {
    return new Array(heartCount).fill(0).map((_, i) => {
      // keep top inside viewport so hearts are visible on desktop and mobile
      const top = Math.round(rand(6, 86)); // percent
      const size = Math.round(rand(20, 48)); // px
      const duration = Number(rand(12, 28).toFixed(2)); // seconds
      const delay = Number(rand(-10, 8).toFixed(2)); // seconds (can be negative)
      // boost opacity floor so at least some hearts are obvious
      const opacity = Number(rand(0.38, 0.96).toFixed(2));
      const rotate = Math.round(rand(-12, 12));
      return { id: i, top, size, duration, delay, opacity, rotate };
    });
  }, [heartCount]);

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* preserve your soft blobs for depth */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts layer (absolute full-cover) */}
      <div
        className="hearts-layer"
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes heartMove {
            0% { transform: translateX(0) translateZ(0) rotate(var(--rot)); opacity: var(--o); }
            50% { opacity: calc(var(--o) + 0.06); }
            100% { transform: translateX(140vw) translateZ(0) rotate(calc(var(--rot) + 18deg)); opacity: 0; }
          }
        `}</style>

        {hearts.map(h => (
          <div
            key={h.id}
            className="heart"
            style={{
              position: "absolute",
              top: `${h.top}%`,
              left: `-28vw`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              backgroundImage: `url("data:image/svg+xml;utf8,${pixelHeartData}")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              opacity: h.opacity,
              transform: `translateX(0) rotate(${h.rotate}deg)`,
              animation: `heartMove ${h.duration}s linear ${h.delay}s infinite`,
              // expose variables for the keyframe usage
              // eslint-disable-next-line no-undef
              // set via style --rot and --o so the keyframes can reference them
              // (React supports custom properties via the style object)
              // we include them here:
              ["--rot"]: `${h.rotate}deg`,
              ["--o"]: `${h.opacity}`,
              zIndex: 0,
              filter: "drop-shadow(0 10px 24px rgba(178,27,97,0.06))",
            }}
          />
        ))}
      </div>
    </div>
  );
}
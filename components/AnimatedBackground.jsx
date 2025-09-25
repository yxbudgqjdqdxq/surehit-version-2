
// components/AnimatedBackground.jsx
import React, { useMemo } from "react";

/**
 * AnimatedBackground
 * - SSR-safe (produces hearts on server too, but uses inline CSS custom props)
 * - Renders soft CSS blobs (your globals.css) + floating pixel hearts left->right
 * - Hearts are small inline-SVG data URIs (no external asset)
 */

const HEART_COUNT_DEFAULT = 14;

const PIXEL_HEART_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
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
</svg>`;
const PIXEL_HEART_URI = `data:image/svg+xml;utf8,${encodeURIComponent(PIXEL_HEART_SVG)}`;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export default function AnimatedBackground({ heartCount = HEART_COUNT_DEFAULT }) {
  // Precompute hearts. Safe on server & client (no window at module-eval)
  const hearts = useMemo(() => {
    return new Array(heartCount).fill(0).map((_, i) => {
      // vertical placement (percent), keep inside viewport
      const top = Math.round(rand(4, 88));
      const size = Math.round(rand(20, 48)); // px
      const duration = Number(rand(12, 28).toFixed(2)); // secs
      const delay = Number(rand(-8, 8).toFixed(2)); // secs - allows stagger
      // keep visible opacities
      const opacity = Number(rand(0.36, 0.95).toFixed(2));
      const rotate = Math.round(rand(-12, 12)); // deg
      return { id: `heart-${i}`, top, size, duration, delay, opacity, rotate };
    });
  }, [heartCount]);

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* soft blobs kept for depth (these classes exist in your globals.css) */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="bg-noise" />

      {/* hearts container (full-cover) */}
      <div className="hearts-container" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Keyframes are in globals.css appended snippet below */}
        {hearts.map(h => (
          <div
            key={h.id}
            className="heart"
            role="presentation"
            style={{
              // position off-screen left initially; keyframes translate it rightwards
              position: "absolute",
              top: `${h.top}%`,
              left: "-28vw",
              width: `${h.size}px`,
              height: `${h.size}px`,
              backgroundImage: `url("${PIXEL_HEART_URI}")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              opacity: h.opacity,
              transform: `translateX(0) rotate(${h.rotate}deg)`,
              animation: `heartMove ${h.duration}s linear ${h.delay}s infinite`,
              willChange: "transform, opacity",
              pointerEvents: "none",
              // expose CSS custom properties used by keyframes / CSS if desired
              // NOTE: React accepts custom properties as strings in the style object
              ["--rot"]: `${h.rotate}deg`,
              ["--o"]: `${h.opacity}`
            }}
          />
        ))}
      </div>
    </div>
  );
}
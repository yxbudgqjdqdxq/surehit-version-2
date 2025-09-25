
// components/AnimatedBackground.jsx  (DEBUG VERSION - replace existing file)
import React, { useEffect } from "react";

export default function AnimatedBackgroundDebug() {
  useEffect(() => {
    console.info("DEBUG: AnimatedBackground mounted");
  }, []);

  const COUNT = 12;
  const boxes = new Array(COUNT).fill(0).map((_, i) => {
    const top = 8 + (i * (80 / COUNT)); // spread down the page
    const size = 60 + (i % 4) * 20; // visible sizes
    const dur = 8 + (i % 5) * 2;
    const delay = -i * 0.6;
    const leftStart = -20 - (i * 6);
    return { id: i, top, size, dur, delay, leftStart };
  });

  return (
    <div
      id="DEBUG-ANIMATED-BG"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,           // VERY TOP so nothing can hide it
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div style={{ position: "absolute", inset: 0, background: "transparent" }} />

      {boxes.map(b => (
        <div
          key={b.id}
          id={`DEBUG_HEART_${b.id}`}
          style={{
            position: "absolute",
            top: `${b.top}%`,
            left: `${b.leftStart}vw`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: "linear-gradient(45deg,#ff2d8e,#ff9ad6)",
            borderRadius: 8,
            opacity: 1,
            transform: `translateX(0)`,
            animation: `DEBUG_MOVE_${b.id} ${b.dur}s linear ${b.delay}s infinite`,
            boxShadow: "0 18px 40px rgba(178,27,97,0.25)",
          }}
        />
      ))}

      <style>{`
        ${boxes.map(b => `
          @keyframes DEBUG_MOVE_${b.id} {
            0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; }
            50% { opacity: 1; transform: translateX(45vw) translateY(-1.5vh) rotate(6deg); }
            100% { transform: translateX(110vw) translateY(-3vh) rotate(0deg); opacity: 1; }
          }
        `).join("\n")}
      `}</style>
    </div>
  );
}
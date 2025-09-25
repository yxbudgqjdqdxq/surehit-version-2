
import React, { useMemo } from 'react';

// A simple, inline pixel heart SVG. Color is set to a bright pink/red.
const PIXEL_HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="%23ff4a4a" width="16" height="16"><path d="M4 1H3V2H2V3H1V4H0V7H1V8H2V9H3V10H4V11H5V12H6V13H7V14H8V15H9V14H10V13H11V12H12V11H13V10H14V9H15V8H16V7H15V4H14V3H13V2H12V1H11V2H10V3H9V4H8V5H7V4H6V3H5V2H4V1Z"/></svg>`;
const SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(PIXEL_HEART_SVG)}`;

const AnimatedBackground = ({ heartCount = 16 }) => {
  const hearts = useMemo(() => {
    // Prevent execution on the server where window is not defined
    if (typeof window === 'undefined') {
      return [];
    }

    return Array.from({ length: heartCount }).map((_, i) => {
      const size = Math.random() * 24 + 12; // 12px to 36px
      const duration = Math.random() * 16 + 12; // 12s to 28s
      const delay = Math.random() * -duration; // Start at a random point in the animation
      const top = Math.random() * 100; // 0% to 100%
      const opacity = Math.random() * 0.6 + 0.36; // 0.36 to 0.96
      const rotation = Math.random() * 30 - 15; // -15deg to 15deg

      return {
        id: i,
        style: {
          '--o': opacity,
          '--rot': `${rotation}deg`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: `url("${SVG_DATA_URI}")`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        },
      };
    });
  }, [heartCount]);

  return (
    <div className="animated-bg" aria-hidden="true">
      {/* These are the soft blob elements from the original CSS */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>
      <div className="blob blob4"></div>

      {/* Container for the hearts */}
      <div className="hearts-container">
        {hearts.map(heart => (
          <div key={heart.id} className="heart" style={heart.style} />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;

import React from 'react';

interface ConfusedFaceEmojiProps {
  className?: string;
}

/**
 * ConfusedFaceEmoji - Custom Animated 😕 Face Component
 * Multi-layer SVG micro-interaction:
 * - Pop in with scale & opacity
 * - Eyes visibly dart LEFT (-5.5px) -> RIGHT (+5.5px) -> CENTER (0px)
 * - Head curious tilt LEFT -> RIGHT -> cute bounce & settle
 * - Plays once per instance with cubic-bezier easing
 */
export const ConfusedFaceEmoji: React.FC<ConfusedFaceEmojiProps> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 w-7 h-7 select-none ${className}`}
      aria-label="Confused reaction emoji"
      role="img"
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full overflow-visible confused-face-reaction"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="confusedGrad"
            cx="32%"
            cy="28%"
            r="70%"
            fx="30%"
            fy="25%"
          >
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="65%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>
          <filter id="confusedShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0.8" stdDeviation="0.6" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Head Base */}
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="url(#confusedGrad)"
          stroke="#E69500"
          strokeWidth="1"
          filter="url(#confusedShadow)"
        />

        {/* Cute Eyebrows (left quizzical / right raised) */}
        <path
          d="M 9.5 11 Q 12.5 12 15 11.5"
          stroke="#7A4700"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 21 10 Q 23.5 7.8 26.5 9.2"
          stroke="#7A4700"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Animated Eyes Group: Visibly glides LEFT -> RIGHT -> CENTER */}
        <g className="confused-eyes-group">
          {/* Left Eye */}
          <circle cx="12" cy="15.5" r="2.6" fill="#3D2406" />
          <circle cx="11.2" cy="14.6" r="0.85" fill="#FFFFFF" />

          {/* Right Eye */}
          <circle cx="24" cy="15.5" r="2.6" fill="#3D2406" />
          <circle cx="23.2" cy="14.6" r="0.85" fill="#FFFFFF" />
        </g>

        {/* Confused Slanted / Asymmetrical Mouth (😕) */}
        <path
          d="M 12 25 Q 18 21.5 24 23.5"
          stroke="#4D2E08"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

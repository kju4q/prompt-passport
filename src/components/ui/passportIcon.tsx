// components/PassportIcon.tsx - Actual Passport Book Shape
import React from "react";

const PassportIcon = ({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) => {
  const dimensions = {
    small: { width: "16px", height: "20px", fontSize: "8px" },
    medium: { width: "20px", height: "24px", fontSize: "10px" },
    large: { width: "24px", height: "28px", fontSize: "12px" },
  };

  const dim = dimensions[size];

  return (
    <div className="relative inline-block">
      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 20 24"
        className="drop-shadow-sm"
      >
        {/* Passport Cover */}
        <rect
          x="2"
          y="2"
          width="16"
          height="20"
          rx="2"
          ry="2"
          fill="url(#passportGradient)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
        />

        {/* Passport Binding */}
        <rect
          x="2"
          y="2"
          width="16"
          height="3"
          rx="2"
          ry="2"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Pages Effect */}
        <rect
          x="0"
          y="4"
          width="2"
          height="16"
          rx="1"
          ry="1"
          fill="rgba(255,255,255,0.8)"
        />

        {/* Sparkle in center */}
        <text
          x="10"
          y="14"
          textAnchor="middle"
          fontSize={dim.fontSize}
          fill="white"
          className="select-none"
        >
          ✨
        </text>

        {/* Gradient Definition */}
        <defs>
          <linearGradient
            id="passportGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default PassportIcon;

// Alternative: CSS Version (Simpler)
export const CSSPassportIcon = ({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) => {
  const sizeClasses = {
    small: "w-4 h-5", // 16×20px
    medium: "w-5 h-6", // 20×24px
    large: "w-6 h-7", // 24×28px
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Main passport body */}
      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-sm relative shadow-md">
        {/* Binding at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-sm"></div>

        {/* Pages on left */}
        <div className="absolute -left-0.5 top-1 bottom-1 w-0.5 bg-white/80 rounded-full"></div>

        {/* Sparkle */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          ✨
        </div>

        {/* Subtle shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-sm pointer-events-none"></div>
      </div>
    </div>
  );
};

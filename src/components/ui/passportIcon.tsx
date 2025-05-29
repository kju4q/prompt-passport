// components/PassportIcon.tsx - Dark Theme Version
import React from "react";

const PassportIcon = ({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-6 h-6", // 24px to match your existing
    large: "w-12 h-12",
  };

  const passportSizes = {
    small: { width: "14px", height: "20px", fontSize: "8px" },
    medium: { width: "12px", height: "16px", fontSize: "7px" },
    large: { width: "20px", height: "28px", fontSize: "12px" },
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
    >
      <div
        className="passport-icon"
        style={{
          width: passportSizes[size].width,
          height: passportSizes[size].height,
        }}
      >
        <div
          className="sparkle"
          style={{ fontSize: passportSizes[size].fontSize }}
        >
          ✨
        </div>
      </div>

      <style jsx>{`
        .passport-icon {
          position: relative;
          border: 1px solid #6b7280;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #f9fafb 0%,
            #e5e7eb 50%,
            #d1d5db 100%
          );
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .passport-icon::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 2px;
          right: 2px;
          height: 2px;
          background: #9ca3af;
          border-radius: 2px 2px 0 0;
        }

        .sparkle {
          color: #4b5563;
          animation: sparkle 3s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.15) rotate(180deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default PassportIcon;

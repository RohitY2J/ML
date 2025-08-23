import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const Disclaimer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-700";
  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-white";
  const balloonColor = "bg-gradient-to-br from-yellow-300 to-yellow-400";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Balloon */}
      <div
        className="relative transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={`w-12 h-12 ${balloonColor} rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 animate-float ${
            isExpanded
              ? "animate-glow scale-110"
              : "scale-100 opacity-70 brightness-75"
          }`}
        >
          {/* Bulb Icon */}
          <svg
            className={`w-6 h-6 text-white transform transition-transform duration-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>

          {/* Pull Switch */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="w-0.5 h-3 bg-gray-400"></div>
            <div
              className={`w-2 h-2 rounded-full bg-gray-400 transition-transform duration-300 ${
                isExpanded ? "translate-y-0" : "translate-y-1"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Disclaimer Message */}
      <div
        className={`absolute bottom-16 right-0 w-96 ${bgColor} rounded-lg shadow-lg transition-all duration-300 transform origin-bottom-right border ${borderColor} ${
          isExpanded
            ? "opacity-100 scale-100 translate-y-0 animate-slideIn"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className={`text-sm font-medium ${textColor}`}>Disclaimer</h3>
          </div>
          <p className={`text-xs ${textColor} leading-relaxed`}>
            The analysis and conclusion provided herein are based on certain
            algorithm and market price action patterns and is designed to be
            used for educational purpose only. This information is of general
            nature, so you should seek advice from your investment advisor
            before making any investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;

"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const CommunitySentiment: React.FC = () => {
  const { theme } = useTheme();
  const bullishPercentage = 81;
  const totalVotes = 3.7;

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const progressBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-red-500";
  const progressBarColor = theme === "dark" ? "bg-[#26A69A]" : "bg-green-500";

  return (
    <div className={`${bgColor} px-4 pt-4 pb-4 border-y ${borderColor}`}>
      <div className="flex items-center mb-3 gap-2">
        <h2 className={`text-xs font-semibold ${textColor}`}>Community Sentiment</h2>
        <span className={`text-11 font-normal ${secondaryTextColor}`}>{totalVotes}M votes</span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className={secondaryTextColor}>{bullishPercentage}% Bullish</span>
        </div>

        {/* Progress bar container */}
        <div className={`h-2 ${progressBgColor} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${progressBarColor} transition-all duration-500`}
            style={{ width: `${bullishPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex items-center">
          <div className={`w-2 h-2 ${progressBarColor} rounded-full mr-2`} />
          <span className={`text-xs font-medium ${textColor}`}>Bullish</span>
        </div>
        <div className="flex items-center">
          <div className={`w-2 h-2 ${progressBgColor} rounded-full mr-2`} />
          <span className={`text-xs font-medium ${textColor}`}>Bearish</span>
        </div>
      </div>
    </div>
  );
};

export default CommunitySentiment;

"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface Segment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PercentageBarProps {
  segments: Segment[];
}

const PercentageBar: React.FC<PercentageBarProps> = ({ segments }) => {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const barBgColor = theme === "dark" ? "bg-dark-default/50" : "bg-gray-100";

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-[13px] font-medium ${secondaryTextColor}`}>
                {segment.label}
              </span>
              <span className={`text-[13px] font-medium ${textColor}`}>
                NPR{" "}
                {segment.value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className={`h-1 ${barBgColor} rounded-full overflow-hidden`}>
              <div
                className={`h-full transition-all duration-300 ${
                  segment.color === "blue"
                    ? "bg-[#2962FF]"
                    : segment.color === "green"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${(segment.value / 700) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PercentageBar;

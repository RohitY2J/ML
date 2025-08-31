"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
export interface PriceStatsProps {
  stats?: Stats
}

export interface Stats{
  currentPrice?: number,
  volume?: number,
  percentChange?: number,
  advanced?: number,
  declined?: number,
  unchanged?: number 
}

const PriceStats: React.FC<PriceStatsProps> = ({stats= {}}) => {
  
  console.log(`Price stats data props: ${stats}`);
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const positiveColor = theme === "dark" ? "text-green-400" : "text-green-600";
  const bgCardColor = theme === "dark" ? "bg-dark-light" : "bg-gray-200";

  return (
    <div className={`${bgColor} px-3 sm:px-4 pt-6 sm:pt-12`}>
      {/* Header Section - Responsive */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
          <Image
            src="https://npstocks.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FNEPSE-logo.93e979e8.png&w=3840&q=75"
            alt="NEPSE"
            fill
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className={`${textColor} font-semibold text-sm sm:text-base truncate`}>Nepal Stock Exchange</h2>
          <p className={`${secondaryTextColor} text-xs sm:text-sm`}>NEPSE</p>
        </div>
      </div>

      {/* Price and Change Section - Responsive */}
      <div className="flex items-center mt-2 sm:mt-3 flex-wrap gap-2">
        <p className={`text-2xl sm:text-32 font-bold ${textColor} flex-shrink-0`}>{stats.currentPrice}</p>
        <p className={`text-xs ${positiveColor} tracking-wide`}>{stats.percentChange}</p>
      </div>

      {/* Cards Section - Responsive Grid */}
      <div className="flex flex-col gap-2 mt-3 sm:mt-4">
        {/* Volume Card */}
        <div className={`px-3 sm:px-1 py-2 border ${bgCardColor} ${borderColor} rounded-lg`}>
          <p className={`${secondaryTextColor} text-10 sm:text-11 font-normal text-center mb-1`}>
            Volume (24h)
          </p>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-sm font-semibold ${textColor} truncate text-center`}>{stats.volume}</p>
          </div>
        </div>

        {/* Market Cap Card */}
        <div className={`px-3 sm:px-1 py-2 border ${bgCardColor} ${borderColor} rounded-lg`}>
          <p className={`${secondaryTextColor} text-10 sm:text-11 font-normal text-center mb-1`}>
            Market Capitalization
          </p>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-xs sm:text-sm font-semibold ${textColor} truncate text-center`}>NPR 133,764,388,689.92</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceStats;
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
    <div className={`${bgColor} px-4 pt-12`}>
      <div className="flex items-center gap-3">
        <div className="relative w-7 h-7">
          <Image
            src="https://npstocks.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FNEPSE-logo.93e979e8.png&w=3840&q=75"
            alt="NEPSE"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h2 className={`${textColor} font-semibold`}>Nepal Stock Exchange</h2>
          <p className={`${secondaryTextColor} text-sm`}>NEPSE</p>
        </div>
      </div>
      <div className="flex items-center mt-3">
        <p className={`text-32 font-bold ${textColor}`}>{stats.currentPrice}</p> &nbsp;&nbsp;
        <p className={`text-xs ${positiveColor} tracking-wide`}>{stats.percentChange}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className={`px-1 py-2 border ${bgCardColor} ${borderColor} rounded-lg`}>
          <p className={`${secondaryTextColor} text-11 font-normal text-center mb-1`}>
            Volume (24h)
          </p>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-sm font-semibold ${textColor}`}>{stats.volume}</p>
          </div>
        </div>
        <div className={`px-1 py-2 border ${bgCardColor} ${borderColor} rounded-lg`}>
          <p className={`${secondaryTextColor} text-11 font-normal text-center mb-1`}>
            Market Capitalization
          </p>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-sm font-semibold ${textColor}`}>NPR 133,764,388,689.92</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceStats;

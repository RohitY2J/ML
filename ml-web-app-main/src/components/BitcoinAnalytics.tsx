"use client"

import React from 'react';
import PercentageBar from './PercentageBar';
import { useTheme } from '@/context/ThemeContext';

const BitcoinAnalytics: React.FC = () => {
  const { theme } = useTheme();
  
  const cardBgColor = theme === 'dark' ? 'bg-dark-light' : 'bg-gray-300/40';
  const textColor = theme === 'dark' ? 'text-[#D1D4DC]' : 'text-black-100';

  return (
    <div className="flex flex-col p-3 sm:p-4 lg:p-6">
      <h2 className={`text-lg sm:text-xl lg:text-[20px] font-medium mb-3 sm:mb-4 ${textColor}`}>NEPSE Analytics</h2>
      
      {/* Responsive Grid: Single column on mobile, 2 columns on medium+ screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Previous 3 Days Close Price */}
        <div className={`${cardBgColor} p-3 sm:p-4 lg:p-5 rounded-lg flex flex-col min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]`}>
          <h3 className={`text-xs sm:text-sm lg:text-[13px] font-medium mb-3 sm:mb-4 ${textColor}`}>
            Previous 3 Days Close Price
          </h3>
          <div className="flex-1">
            <PercentageBar 
              segments={[
                { label: "04-15", value: 479.73, percentage: 479.73, color: "blue" },
                { label: "04-16", value: 498.92, percentage: 498.92, color: "green" },
                { label: "04-17", value: 500.35, percentage: 500.35, color: "orange" },
              ]} 
            />
          </div>
        </div>

        {/* 52 Week Range */}
        <div className={`${cardBgColor} p-3 sm:p-4 lg:p-5 rounded-lg flex flex-col min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]`}>
          <h3 className={`text-xs sm:text-sm lg:text-[13px] font-medium mb-3 sm:mb-4 ${textColor}`}>
            52 Week High / 52 Week Low
          </h3>
          <div className="flex-1">
            <PercentageBar 
              segments={[
                { label: "High", value: 700.00, percentage: 50, color: "blue" },
                { label: "Low", value: 419.00, percentage: 50, color: "green" }
              ]} 
            />
          </div>
        </div>

        {/* Market Breadth - Full Width on larger screens, single column on mobile
        <div className="col-span-1 lg:col-span-2">
          <MarketBreadth />
        </div> */}
      </div>
    </div>
  );
};

export default BitcoinAnalytics;
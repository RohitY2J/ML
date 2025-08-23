"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface MarketData {
  [key: string]: {
    n: string;
    v: number;
    pc: number;
    t: number;
    si: number;
    d: string;
    o: number;
  };
}

interface MarketTickerProps {
  data: MarketData;
}

const MarketTicker: React.FC<MarketTickerProps> = ({ data }) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isScrolling, setIsScrolling] = useState(true);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const scrollTicker = () => {
      if (!isScrolling) return;
      
      if (ticker.scrollLeft >= ticker.scrollWidth - ticker.clientWidth) {
        ticker.scrollLeft = 0;
      } else {
        ticker.scrollLeft += 1;
      }
    };

    const interval = setInterval(scrollTicker, 30);
    return () => clearInterval(interval);
  }, [isScrolling]);

  const bgColor = theme === 'dark' ? 'bg-dark-light' : 'bg-gray-300/40';
  const textColor = theme === 'dark' ? 'text-[#D1D4DC]' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#9598A1]' : 'text-gray-500';
  const positiveColor = theme === 'dark' ? 'text-[#26A69A]' : 'text-green-500';
  const negativeColor = theme === 'dark' ? 'text-[#EF5350]' : 'text-red-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2E39]' : 'border-gray-200';

  // Convert data object to array and sort by order
  const sortedData = Object.entries(data)
    .map(([key, value]) => ({ ...value, key }))
    .sort((a, b) => a.o - b.o);

  return (
    <div 
      className={`${bgColor} border-t ${borderColor} py-2`}
      onMouseEnter={() => setIsScrolling(false)}
      onMouseLeave={() => setIsScrolling(true)}
    >
      <div
        ref={tickerRef}
        className="flex overflow-x-hidden whitespace-nowrap"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {sortedData.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-4 px-4 border-r border-gray-200 last:border-r-0 min-w-[250px]"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-11 font-semibold ${textColor} truncate`}>{item.n}</span>
              <span className={`text-11 ${secondaryTextColor}`}>
                {item.v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className={`text-11 font-semibold ${item.pc >= 0 ? positiveColor : negativeColor}`}>
                {item.pc >= 0 ? '+' : ''}{item.pc.toFixed(2)}%
              </span>
              <span className={`text-11 ${secondaryTextColor}`}>
                {item.t.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
        {/* Duplicate items for seamless scrolling */}
        {sortedData.map((item) => (
          <div
            key={`${item.key}-duplicate`}
            className="flex items-center gap-4 px-4 border-r border-gray-200 last:border-r-0 min-w-[250px]"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-11 font-semibold ${textColor} truncate`}>{item.n}</span>
              <span className={`text-11 ${secondaryTextColor}`}>
                {item.v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className={`text-11 font-semibold ${item.pc >= 0 ? positiveColor : negativeColor}`}>
                {item.pc >= 0 ? '+' : ''}{item.pc.toFixed(2)}%
              </span>
              <span className={`text-11 ${secondaryTextColor}`}>
                {item.t.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker; 
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
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const scrollTicker = () => {
      if (!isScrolling) return;
      
      if (ticker.scrollLeft >= ticker.scrollWidth - ticker.clientWidth) {
        ticker.scrollLeft = 0;
      } else {
        ticker.scrollLeft += isMobile ? 0.5 : 1; // Slower scroll on mobile
      }
    };

    const interval = setInterval(scrollTicker, isMobile ? 50 : 30); // Slower interval on mobile
    return () => clearInterval(interval);
  }, [isScrolling, isMobile]);

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
      onTouchStart={() => setIsScrolling(false)}
      onTouchEnd={() => setIsScrolling(true)}
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
            className={`flex items-center justify-between px-2 sm:px-3 md:px-4 border-r border-gray-200 last:border-r-0 ${
              isMobile ? 'min-w-[140px] gap-1' : 'min-w-[200px] sm:min-w-[250px] gap-2 sm:gap-4'
            }`}
          >
            {/* Left side - Symbol and Value */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-semibold ${textColor} truncate leading-tight`}>
                {isMobile ? item.n.substring(0, 6) + (item.n.length > 6 ? '...' : '') : item.n}
              </span>
              <span className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] ${secondaryTextColor} leading-tight`}>
                {item.v.toLocaleString('en-US', { 
                  minimumFractionDigits: isMobile ? 0 : 1, 
                  maximumFractionDigits: isMobile ? 1 : 2 
                })}
              </span>
            </div>
            
            {/* Right side - Percentage and Total */}
            <div className="flex flex-col items-end flex-shrink-0 min-w-0">
              <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-semibold ${item.pc >= 0 ? positiveColor : negativeColor} leading-tight`}>
                {item.pc >= 0 ? '+' : ''}{item.pc.toFixed(isMobile ? 1 : 2)}%
              </span>
              <span className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] ${secondaryTextColor} leading-tight truncate max-w-[60px] sm:max-w-none`}>
                {isMobile 
                  ? item.t > 1000 
                    ? `${(item.t / 1000).toFixed(0)}K`
                    : item.t.toFixed(0)
                  : item.t.toLocaleString('en-US', { 
                      minimumFractionDigits: 1, 
                      maximumFractionDigits: 2 
                    })
                }
              </span>
            </div>
          </div>
        ))}
        
        {/* Duplicate items for seamless scrolling */}
        {sortedData.map((item) => (
          <div
            key={`${item.key}-duplicate`}
            className={`flex items-center justify-between px-2 sm:px-3 md:px-4 border-r border-gray-200 last:border-r-0 ${
              isMobile ? 'min-w-[140px] gap-1' : 'min-w-[200px] sm:min-w-[250px] gap-2 sm:gap-4'
            }`}
          >
            {/* Left side - Symbol and Value */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-semibold ${textColor} truncate leading-tight`}>
                {isMobile ? item.n.substring(0, 6) + (item.n.length > 6 ? '...' : '') : item.n}
              </span>
              <span className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] ${secondaryTextColor} leading-tight`}>
                {item.v.toLocaleString('en-US', { 
                  minimumFractionDigits: isMobile ? 0 : 1, 
                  maximumFractionDigits: isMobile ? 1 : 2 
                })}
              </span>
            </div>
            
            {/* Right side - Percentage and Total */}
            <div className="flex flex-col items-end flex-shrink-0 min-w-0">
              <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-semibold ${item.pc >= 0 ? positiveColor : negativeColor} leading-tight`}>
                {item.pc >= 0 ? '+' : ''}{item.pc.toFixed(isMobile ? 1 : 2)}%
              </span>
              <span className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] ${secondaryTextColor} leading-tight truncate max-w-[60px] sm:max-w-none`}>
                {isMobile 
                  ? item.t > 1000 
                    ? `${(item.t / 1000).toFixed(0)}K`
                    : item.t.toFixed(0)
                  : item.t.toLocaleString('en-US', { 
                      minimumFractionDigits: 1, 
                      maximumFractionDigits: 2 
                    })
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
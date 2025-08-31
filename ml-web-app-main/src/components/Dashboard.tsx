"use client";

import PriceStats, { Stats } from "@/components/PriceStats";
import Chart from "@/components/Chart";
import NewsSection from "@/components/NewsSection";
import CommunitySentiment from "@/components/CommunitySentiment";
import SocialLinks from "@/components/SocialLinks";
import BitcoinAnalytics from "@/components/BitcoinAnalytics";
import ChartRightSection from "@/components/ChartRightSection";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import Gainers from "./Gainers";
import MarketBreadth from "./MarketBreadth";
import MarketTicker from "./MarketTicker";
import { marketData } from "@/constants/mockdata";
import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { isSidebarExpanded } = useSidebar();
  const { theme } = useTheme();
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const scrollbarColor = theme === "dark" ? "scrollbar-dark" : "scrollbar-light";
  const [priceStatsData, setPriceStatsDataetZonesData] = useState<Stats | undefined>(undefined);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchDailyPriceStatsData = async() => {
    try {
      // Fetch support and resistance zones
      const response = await axiosInstance.get(
        `/api/stocks/dailyPriceStats/NEPSE`
      );
      console.log(response.data.data);
      setPriceStatsDataetZonesData(response.data.data);
    }
    catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      //setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDailyPriceStatsData();
  }, []);

  return (
    <div className={`flex flex-col lg:flex-row lg:h-[calc(100vh)] ${bgColor}`}>
      {/* Mobile Header with Menu Toggle */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b ${borderColor}`}>
        <h1 className={`text-lg font-semibold ${theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900"}`}>
          Dashboard
        </h1>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`p-2 rounded-lg ${theme === "dark" ? "bg-dark-light text-[#D1D4DC]" : "bg-gray-100 text-gray-900"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Overlay Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className={`w-80 h-full ${bgColor} ${scrollbarColor} overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900"}`}>
                  Menu
                </h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className={`p-2 rounded-lg ${theme === "dark" ? "bg-dark-light text-[#D1D4DC]" : "bg-gray-100 text-gray-900"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PriceStats stats={priceStatsData}/>
              <MarketBreadth marketStats={priceStatsData} />
              <SocialLinks />
              <CommunitySentiment />
              <Gainers />
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Hidden on mobile, shown on larger screens */}
      <div
        className={`hidden lg:block shrink-0 w-[330px] min-w-[329px] overflow-y-auto border-r ${borderColor} ${scrollbarColor}`}
      >
        <div className="flex flex-col gap-4">
          <PriceStats stats={priceStatsData}/>
          <MarketBreadth marketStats={priceStatsData} />
          <SocialLinks />
          <CommunitySentiment />
          <Gainers />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 sm:flex sm:flex-col lg:flex-row overflow-y-auto max-sm:overflow-hidden">
        {/* Chart and Market Data Section */}
        <div className="flex h-full"></div>
        <div className="flex-1 flex flex-col min-w-0 max-sm:overflow-y-auto max-sm:max-h-[600px]">
          {/* Chart Section */}
          <div className="sm:mb-4 lg:mb-8 sm:px-4 lg:px-0">
            <Chart />
          </div>
          
          {/* Market Ticker - Responsive */}
          <div className="px-2 lg:px-6">
            <MarketTicker data={marketData} />
          </div>
          
          {/* Bitcoin Analytics */}
          <div className="px-2 lg:px-0">
            <BitcoinAnalytics />
          </div>
        </div>

        {/* Right Section - Responsive behavior */}
        <div className={`shrink-0 ${
          // On mobile: full width with border-t, on large screens: fixed width with border-l
          isSidebarExpanded 
            ? "w-full lg:w-auto border-t lg:border-t-0 lg:border-l lg:xl:hidden" 
            : "w-full lg:w-auto border-t lg:border-t-0 lg:border-l lg:xl:block"
        } ${borderColor}`}>
          <div className="p-2 lg:p-4">
            <ChartRightSection />
          </div>
        </div>
      </div>

      {/* News Section - Responsive positioning */}
      <div
        className={`shrink-0 lg:w-[315px]
          w-full lg:w-[315px] lg:shrink-0 
          lg:border-l ${borderColor}
          border-t lg:border-t-0
          ${isSidebarExpanded ? "xl:hidden" : "xl:block"}
          overflow-y-auto ${scrollbarColor}
          max-h-60 lg:max-h-none
        `}
      >
        <NewsSection />
      </div>
    </div>
  );
}
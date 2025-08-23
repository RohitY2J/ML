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
    <div className={`flex h-[calc(100vh)] ${bgColor}`}>
      <div
        className={`shrink-0 w-[330px] min-w-[329px] overflow-y-auto border-r ${borderColor} ${scrollbarColor}`}
      >
        <div className="flex flex-col gap-4">
          <PriceStats stats={priceStatsData}/>
          <MarketBreadth marketStats={priceStatsData} />
          <SocialLinks />
          <CommunitySentiment />
          <Gainers />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-8">
              <Chart />
            </div>
            <div className="px-6">
              <MarketTicker data={marketData} />
            </div>
            <BitcoinAnalytics />
          </div>
          <div className={`shrink-0 p-4`}>
            <ChartRightSection />
          </div>
        </div>
      </div>
      <div
        className={`shrink-0 w-[315px] overflow-y-auto border-l ${borderColor} ${
          isSidebarExpanded ? "xl:hidden" : "xl:block"
        } scrollbar-light`}
      >
        <NewsSection />
      </div>
    </div>
  );
}

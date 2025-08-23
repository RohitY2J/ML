"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";
import { useTradingZones } from "@/hooks/useTradingZones";
import { useChat } from "@/hooks/useChat";
import AddStockModal from "./AddStockModal";
import { TradingSignalsTable } from "./TradingSignalsTable";
import CurrentStrategySection from "./CurrentStrategySection";
import WatchlistSection from "./WatchlistSection";
import AIChatBoxSection from "./AIChatBoxSection";
import AITechnicalAnalysisSection from "./AITechnicalAnalysisSection";
import {
  RiLineChartLine,
  RiBrainLine,
  RiSignalTowerLine,
  RiBookmarkLine,
  RiChatSmileLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
} from "react-icons/ri";

interface ChartRightSectionProps {
  onSymbolChange?: (symbol: string) => void;
  currentSymbol?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

const ChartRightSection: React.FC<ChartRightSectionProps> = ({
  onSymbolChange,
  currentSymbol = "NEPSE",
  onCollapseChange,
}) => {
  const [question, setQuestion] = useState("");
  const { theme } = useTheme();
  const pathname = usePathname();
  const isEditPage = pathname?.includes("/edit");

  // Main collapse state for the entire right section
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Vertical collapse states for individual sections
  const [verticallyCollapsedSections, setVerticallyCollapsedSections] = useState({
    currentStrategy: true,
    aiTechnicalAnalysis: true,
    tradingSignals: true,
    watchlist: true,
    aiChat: true,
  });

  // Use React Query hooks
  const { data: tradingZones } = useTradingZones(currentSymbol);
  const {
    mutate: sendChatMessage,
    data: chatResponse,
    isPending: isChatLoading,
    error: chatError,
  } = useChat();

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [watchlistData, setWatchlistData] = useState([
    { sn: 1, stock: "NEPSE", ltp: 2150.45, change: 1.25 },
    { sn: 2, stock: "NRIC", ltp: 850.75, change: 0.85 },
    { sn: 3, stock: "NBL", ltp: 450.2, change: -0.35 },
    { sn: 4, stock: "SCB", ltp: 850.75, change: 0.25 },
    { sn: 5, stock: "HBL", ltp: 1200.0, change: 0.1 },
  ]);

  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const positiveColor = theme === "dark" ? "text-[#26A69A]" : "text-green-500";
  const negativeColor = theme === "dark" ? "text-[#EF5350]" : "text-red-500";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const hoverBgColor = theme === "dark" ? "hover:bg-dark-light" : "hover:bg-gray-100";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    sendChatMessage(question, {
      onSuccess: () => {
        setQuestion("");
      },
    });
  };

  const handleStockClick = (stock: string) => {
    if (watchlistData.some((item) => item.stock === stock)) {
      console.log("Stock already in watchlist!");
    } else {
      handleAddStock(stock);
    }
    if (onSymbolChange) {
      onSymbolChange(stock);
    }
  };

  const handleAddStock = (stock: string) => {
    // Here you would typically fetch the stock data from your API
    const newStock = {
      sn: watchlistData.length + 1,
      stock,
      ltp: 0, // This should come from your API
      change: 0, // This should come from your API
    };
    setWatchlistData([...watchlistData, newStock]);
  };

  const formatPrice = (price: string | undefined) => {
    if (!price) return "N/A";
    return Math.round(parseFloat(price)).toString();
  };

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    if (newCollapsedState) {
      // When horizontally collapsing, also collapse all sections vertically
      setVerticallyCollapsedSections({
        currentStrategy: true,
        aiTechnicalAnalysis: true,
        tradingSignals: true,
        watchlist: true,
        aiChat: true,
      });
    } else {
      // When horizontally expanding, keep all sections collapsed by default
      setVerticallyCollapsedSections({
        currentStrategy: true,
        aiTechnicalAnalysis: true,
        tradingSignals: true,
        watchlist: true,
        aiChat: true,
      });
    }

    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  const toggleVerticalCollapse = (section: keyof typeof verticallyCollapsedSections) => {
    // Only allow vertical collapse when horizontally expanded
    if (isCollapsed) {
      return;
    }

    setVerticallyCollapsedSections((prev) => {
      const newState = { ...prev };
      // Simply toggle the clicked section
      newState[section] = !prev[section];
      return newState;
    });
  };

  // Notify parent of initial state
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const CollapsibleSection = ({
    title,
    icon,
    children,
    isCollapsed: sectionCollapsed,
    sectionKey,
    isVerticallyCollapsed,
    className,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isCollapsed: boolean;
    sectionKey: keyof typeof verticallyCollapsedSections;
    isVerticallyCollapsed: boolean;
    className?: string;
  }) => (
    <div
      className={`border ${borderColor} ${hoverBgColor} rounded-lg group cursor-pointer overflow-hidden flex items-center justify-center ${className}`}
    >
      {!sectionCollapsed && (
        <div
          onClick={() => toggleVerticalCollapse(sectionKey)}
          className={`px-4 py-2 ${textColor} border-b ${borderColor} whitespace-nowrap hover:bg-opacity-80 transition-colors duration-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-400">{icon}</span>
              <span className="font-medium text-sm opacity-80">{title}</span>
            </div>
            <span className="text-gray-400">
              {isVerticallyCollapsed ? (
                <RiArrowRightSLine className="w-4 h-4" />
              ) : (
                <RiArrowDownSLine className="w-4 h-4" />
              )}
            </span>
          </div>
        </div>
      )}
      {!sectionCollapsed && !isVerticallyCollapsed && <div className="p-3 w-full">{children}</div>}
      {sectionCollapsed && (
        <button
          onClick={() => {
            // First expand horizontally
            toggleCollapse();
            // Then expand this specific section vertically
            setTimeout(() => {
              setVerticallyCollapsedSections((prev) => {
                const newState = { ...prev };
                // Expand only this section
                newState[sectionKey] = false;
                return newState;
              });
            }, 300); // Wait for horizontal expansion animation
          }}
          className="p-3 items-center flex justify-center"
        >
          <span
            className={`text-xl text-center text-gray-400 group-hover:${textColor} transition-colors duration-200`}
          >
            {icon}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`h-full flex flex-col ${
        isCollapsed ? "w-20" : "w-80"
      } transition-all duration-300 border-l ${borderColor}`}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-center"></div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto p-3 pt-8 space-y-3">
        {/* Current Strategy Section */}
        <CollapsibleSection
          title="Current Strategy"
          className="flex-col"
          icon={<RiLineChartLine />}
          isCollapsed={isCollapsed}
          sectionKey="currentStrategy"
          isVerticallyCollapsed={verticallyCollapsedSections.currentStrategy}
        >
          <CurrentStrategySection
            tradingZones={tradingZones?.data}
            theme={theme}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            positiveColor={positiveColor}
            formatPrice={formatPrice}
          />
        </CollapsibleSection>

        {/* AI Technical Analysis Section */}
        <CollapsibleSection
          title="AI Technical Analysis"
          icon={<RiBrainLine />}
          isCollapsed={isCollapsed}
          className="flex-col"
          sectionKey="aiTechnicalAnalysis"
          isVerticallyCollapsed={verticallyCollapsedSections.aiTechnicalAnalysis}
        >
          <AITechnicalAnalysisSection
            isEditPage={isEditPage}
            currentSymbol={currentSymbol}
            theme={theme}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            positiveColor={positiveColor}
            negativeColor={negativeColor}
          />
        </CollapsibleSection>

        {/* Buy/Sell/Hold Section */}
        <CollapsibleSection
          className="flex-col"
          title="Trading Signals"
          icon={<RiSignalTowerLine />}
          isCollapsed={isCollapsed}
          sectionKey="tradingSignals"
          isVerticallyCollapsed={verticallyCollapsedSections.tradingSignals}
        >
          <TradingSignalsTable onStockClick={handleStockClick} />
        </CollapsibleSection>

        {/* Watchlist Section */}
        <CollapsibleSection
          className="flex-col"
          title="Watchlist"
          icon={<RiBookmarkLine />}
          isCollapsed={isCollapsed}
          sectionKey="watchlist"
          isVerticallyCollapsed={verticallyCollapsedSections.watchlist}
        >
          <WatchlistSection
            watchlistData={watchlistData}
            onStockClick={handleStockClick}
            theme={theme}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
            positiveColor={positiveColor}
            negativeColor={negativeColor}
          />
        </CollapsibleSection>

        {isEditPage && (
          <CollapsibleSection
            title="AI Chat"
            icon={<RiChatSmileLine />}
            isCollapsed={isCollapsed}
            sectionKey="aiChat"
            isVerticallyCollapsed={verticallyCollapsedSections.aiChat}
          >
            <AIChatBoxSection
              question={question}
              setQuestion={setQuestion}
              response={chatResponse?.response || ""}
              isLoading={isChatLoading}
              error={chatError?.message || ""}
              handleSubmit={handleSubmit}
              theme={theme}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
              borderColor={borderColor}
            />
          </CollapsibleSection>
        )}
      </div>

      {/* Collapse Button at Bottom */}
      <div className={`p-3 border-t flex flex-col gap-4 ${borderColor}`}>
        {/* TODO: Bagale: Add dark/light mode button here with rounded border, no border color, add padding, transition, and hover effects. No need to add text for light and dark mode */}
        <button
          onClick={toggleCollapse}
          className={`w-full flex items-center justify-center p-2 rounded-lg ${hoverBgColor} ${textColor} transition-colors duration-200`}
        >
          {isCollapsed ? (
            <RiMenuUnfoldLine className="w-5 h-5" />
          ) : (
            <RiMenuFoldLine className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onAdd={handleAddStock}
      />
    </div>
  );
};

export default ChartRightSection;

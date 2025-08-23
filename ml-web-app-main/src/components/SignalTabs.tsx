import React, { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import AISignalHistory from "./AISignalHistory";

interface SignalTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  isLoading: boolean;
  onExpand?: (expanded: boolean) => void;
}

const SignalTabs: React.FC<SignalTabsProps> = ({
  data,
  isLoading,
  onExpand,
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "current">("history");
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const tabBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-[#EFF2F5]";
  const tabIndicatorColor = theme === "dark" ? "bg-[#2962FF]" : "bg-[#2962FF]";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-700";
  const secondaryTextColor =
    theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const buttonTextColor =
    theme === "dark" ? "text-[#D1D4DC]" : "text-[#ffffff]";
  const buttonHoverTextColor =
    theme === "dark" ? "text-white" : "text-gray-900";

  const handleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpand?.(newExpandedState);
  };

  const historyData = data || [];
  const currentSignal = historyData[0]; // Most recent signal

  return (
    <div
      className={`rounded-lg ${bgColor} shadow-sm border ${
        isExpanded ? "h-[95vh]" : "h-[25vh]"
      } ${theme === "dark" ? "border-[#2A2E39]" : "border-gray-200"}`}
    >
      {/* Tabs */}
      <div className={`relative flex mb-4 ${tabBgColor} rounded-lg p-1`}>
        <button
          onClick={() => setActiveTab("history")}
          className={`relative flex-1 py-2 text-[11px] transition-colors duration-300 rounded-md z-10 ${
            activeTab === "history"
              ? buttonTextColor
              : `${secondaryTextColor} font-normal`
          }`}
        >
          AI SIGNAL HISTORY
        </button>
        <button
          onClick={() => setActiveTab("current")}
          className={`relative flex-1 py-2 text-[11px] transition-colors duration-300 rounded-md z-10 ${
            activeTab === "current"
              ? buttonTextColor
              : `${secondaryTextColor} font-normal`
          }`}
        >
          CURRENT SIGNAL
        </button>
        {/* Sliding background */}
        <div
          className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] ${tabIndicatorColor} rounded-md transition-all duration-300 ease-in-out ${
            activeTab === "history" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />
      </div>

      {/* Expand/Collapse Button */}
      <div className="px-4 pb-2">
        <button
          onClick={handleExpand}
          className={`flex items-center gap-1 text-[11px] ${secondaryTextColor} hover:${buttonHoverTextColor} transition-colors duration-200`}
        >
          {isExpanded ? (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Expand
            </>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div
        className={`px-4 pb-4 transition-all duration-300  ${
          isExpanded ? "h-[60vh]" : "h-[12vh]"
        } overflow-auto`}
      >
        {isLoading ? (
          <div className={`text-center py-4 ${textColor}`}>Loading...</div>
        ) : activeTab === "history" ? (
          <div className="h-full overflow-auto scrollbar-light pr-2">
            <AISignalHistory data={historyData} />
          </div>
        ) : (
          <div className="h-full overflow-auto scrollbar-light pr-2">
            <table className="min-w-full">
              <thead
                className={`${bgColor} border-b ${
                  theme === "dark" ? "border-[#2A2E39]" : "border-gray-200"
                } sticky top-0 z-10`}
              >
                <tr>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Stock
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Signal
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Buy Date
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Buy Price
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Adj. Buy Price
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Sold
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Sold Price
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    CurrentStrategy
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    PointChange
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Profit/Loss%
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    BuyRange
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Sell Range
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    Risk-To-Reward Ratio
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    StopLoss
                  </th>
                  <th
                    className={`px-4 py-2 text-left text-[12px] font-normal ${textColor} uppercase tracking-wider whitespace-nowrap`}
                  >
                    TradeResult
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  theme === "dark" ? "divide-[#2A2E39]" : "divide-gray-200"
                }`}
              >
                {currentSignal && (
                  <tr
                    className={`${
                      theme === "dark"
                        ? "hover:bg-[#2A2E39]"
                        : "hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Stock || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          currentSignal.Signal === "BUY"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : currentSignal.Signal === "SELL"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {currentSignal.Signal || "N/A"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Buy_Date || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Buy_Price || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Adj_Buy_Price || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Sold || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Sold_Price || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Current_Strategy || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Point_Change || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Profit_Loss || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Buy_Range || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Sell_Range || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Risk_To_Reward_Ratio || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      {currentSignal.Stop_Loss || "N/A"}
                    </td>
                    <td
                      className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
                    >
                      <span
                        className={
                          currentSignal.Signal === "BUY"
                            ? "text-green-600 dark:text-green-400"
                            : currentSignal.Signal === "SELL"
                            ? "text-red-600 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }
                      >
                        {currentSignal.Trade_Result || "N/A"}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalTabs;

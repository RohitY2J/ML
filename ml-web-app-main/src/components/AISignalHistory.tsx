import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { CombinedSignal } from "@/services/api/combinedSignals";

interface AISignalHistoryProps {
  data: CombinedSignal[];
}

const AISignalHistory: React.FC<AISignalHistoryProps> = ({ data }) => {
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-700";

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "-") return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="w-full">
      <table className="min-w-full">
        <thead
          className={`${bgColor} border-b ${
            theme === "dark" ? "border-[#2A2E39]" : "border-gray-200"
          }`}
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
          {data.map((signal, index) => (
            <tr
              key={index}
              className={`${
                theme === "dark" ? "hover:bg-[#2A2E39]" : "hover:bg-gray-50"
              } transition-colors duration-200`}
            >
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal.Stock || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    signal.Signal === "BUY"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : signal.Signal === "SELL"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {signal.Signal || "N/A"}
                </span>
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {formatDate(signal["Buy Date"])}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Buy Price"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Adj. Buy Price"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal.Sold || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Sold Price"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Current Strategy"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Point Change"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Profit/Loss%"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Buy Range"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Sell Range"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Risk-To-Reward Ratio"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                {signal["Stop Loss"] || "N/A"}
              </td>
              <td
                className={`px-4 py-2 whitespace-nowrap text-[12px] ${textColor}`}
              >
                <span
                  className={
                    signal.Signal === "BUY"
                      ? "text-green-600 dark:text-green-400"
                      : signal.Signal === "SELL"
                      ? "text-red-600 dark:text-red-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }
                >
                  {signal["Trade Result"] || "N/A"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AISignalHistory;

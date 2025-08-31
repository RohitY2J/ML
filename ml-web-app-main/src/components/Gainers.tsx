import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface Gainer {
  symbol: string;
  ltp: number;
  change: number;
  qty: number;
}

const Gainers: React.FC = () => {
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor =
    theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const positiveColor = theme === "dark" ? "text-[#26A69A]" : "text-green-500";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  const gainers: Gainer[] = [
    { symbol: "CREST", ltp: 1679.1, change: 10, qty: 1330 },
    { symbol: "NMIC", ltp: 2031.1, change: 10, qty: 4840 },
    { symbol: "BPCL", ltp: 534.1, change: 9.99, qty: 731242 },
    { symbol: "OMPL", ltp: 395.2, change: 9.99, qty: 150 },
    { symbol: "PHCL", ltp: 603.99, change: 9.98, qty: 118746 }
  ];

  return (
    <div className={`${bgColor} p-3 sm:p-4`}>
      <h3 className={`text-sm font-semibold mb-3 sm:mb-4 ${textColor}`}>Top Gainers</h3>
      
      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-3">
        {gainers.map((gainer) => (
          <div
            key={gainer.symbol}
            className={`border ${borderColor} rounded-lg p-3`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-semibold ${textColor}`}>
                {gainer.symbol}
              </span>
              <span className={`text-sm ${positiveColor}`}>
                +{gainer.change.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-xs ${secondaryTextColor}`}>LTP</p>
                <p className={`text-sm ${textColor}`}>
                  {gainer.ltp.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${secondaryTextColor}`}>Qty</p>
                <p className={`text-sm ${textColor}`}>
                  {gainer.qty.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`text-left text-11 ${secondaryTextColor}`}>
              <th className="pb-2">Symbol</th>
              <th className="pb-2">LTP</th>
              <th className="pb-2">% Change</th>
              <th className="pb-2">Qty</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {gainers.map((gainer) => (
              <tr
                key={gainer.symbol}
                className={`border-b ${borderColor} last:border-b-0`}
              >
                <td className={`py-2 text-11 font-semibold ${textColor}`}>
                  {gainer.symbol}
                </td>
                <td className={`py-2 text-11 ${textColor}`}>
                  {gainer.ltp.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className={`py-2 text-11 ${positiveColor}`}>
                  +{gainer.change.toFixed(2)}
                </td>
                <td className={`py-2 text-11 ${textColor}`}>
                  {gainer.qty.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gainers;
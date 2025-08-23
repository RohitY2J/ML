import React from "react";

interface WatchlistStock {
  sn: number;
  stock: string;
  ltp: number;
  change: number;
}

interface WatchlistSectionProps {
  watchlistData: WatchlistStock[];
  onStockClick: (stock: string) => void;
  theme: string;
  textColor: string;
  secondaryTextColor: string;
  positiveColor: string;
  negativeColor: string;
}

const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlistData,
  onStockClick,
  theme,
  textColor,
  secondaryTextColor,
  positiveColor,
  negativeColor,
}) => {
  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${textColor}`}>Watchlist</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`text-left text-11 ${secondaryTextColor}`}>
              <th className="pb-2">S.N</th>
              <th className="pb-2">Stock</th>
              <th className="pb-2">LTP</th>
              <th className="pb-2">Change</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {watchlistData.map((stock) => (
              <tr
                key={stock.sn}
                onClick={() => onStockClick(stock.stock)}
                className="cursor-pointer hover:opacity-80"
              >
                <td className={`py-1 text-11 ${textColor}`}>{stock.sn}</td>
                <td className={`py-1 text-11 font-semibold ${textColor}`}>
                  {stock.stock}
                </td>
                <td className={`py-1 text-11 font-semibold ${textColor}`}>
                  {stock.ltp}
                </td>
                <td
                  className={`py-1 text-11 ${
                    stock.change >= 0 ? positiveColor : negativeColor
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WatchlistSection;

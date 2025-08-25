"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddStockModal from "@/components/AddStockModal";
import axiosInstance from "@/lib/axios";

interface Watchlist{
  id: number,
  stock: string,
  ltp: number,
  change: number,
  signal: string,
}

export default function WatchlistPage() {
  const { theme } = useTheme();
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [watchlistData, setWatchlistData] = useState<Watchlist[]>([]);

  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const positiveColor = theme === "dark" ? "text-[#26A69A]" : "text-green-500";
  const negativeColor = theme === "dark" ? "text-[#EF5350]" : "text-red-500";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const pageBgColor = theme === "dark" ? "bg-dark-default" : "bg-white";

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return positiveColor;
      case "SELL":
        return negativeColor;
      case "HOLD":
        return secondaryTextColor;
      default:
        return textColor;
    }
  };

  const handleAddStock = (stock: string) => {
    // const newStock = {
    //   sn: watchlistData.length + 1,
    //   stock,
    //   ltp: 0,
    //   change: 0,
    //   signal: "HOLD", // Default signal for new stocks
    // };
    //setWatchlistData([...watchlistData, newStock]);
    console.log(stock);
  };

  const handleDeleteStock = async (stockToDelete: string) => {
    const response = await axiosInstance.post(
      `/api/signals/updateToWatchList`, {symbol: stockToDelete, toAdd: false}
    );

    console.log(response);
    setWatchlistData(response.data.data);
  };

  useEffect(() => {
      fetchWatchListData();
    }, [])
  
  const fetchWatchListData =  async() => {
    const response = await axiosInstance.get(
      `/api/signals/getWatchList`
    );

    console.log(response);
    setWatchlistData(response.data.data);
  }

  return (
    <div className={`h-full flex flex-col gap-4 p-4 ${pageBgColor}`}>
      {/* Header Section */}
      <div className={`${bgColor} p-4 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-sm font-semibold ${textColor}`}>Watchlist</h1>
            <p className={`text-11 ${secondaryTextColor}`}>Manage your watchlist stocks</p>
          </div>
          {/* <button
            onClick={() => setIsAddStockModalOpen(true)}
            className={`px-4 py-2 rounded-lg text-11 font-medium ${
              theme === "dark" ? "bg-[#2962FF] hover:bg-[#1E53E5]" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          >
            + Add Stock
          </button> */}
        </div>
      </div>

      {/* Watchlist Table Section */}
      <div className={`${bgColor} p-4 rounded-lg flex-1`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left border-b ${borderColor}`}>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>S.N</th>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>Stock</th>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>LTP</th>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>Change</th>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>Signal</th>
                <th className={`pb-2 text-11 ${secondaryTextColor}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {watchlistData.map((stock, index) => (
                <tr key={stock.id} className={`border-b ${borderColor} last:border-b-0`}>
                  <td className={`py-2 text-11 ${textColor}`}>{index + 1}</td>
                  <td className={`py-2 text-11 font-semibold ${textColor}`}>{stock.stock}</td>
                  <td className={`py-2 text-11 font-semibold ${textColor}`}>{stock.ltp}</td>
                  <td
                    className={`py-2 text-11 ${stock.change >= 0 ? positiveColor : negativeColor}`}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change}%
                  </td>
                  <td className={`py-2 text-11 font-medium ${getSignalColor(stock.signal)}`}>
                    {stock.signal}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDeleteStock(stock.stock)}
                      className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${secondaryTextColor} hover:text-red-500 transition-colors`}
                    >
                      <RiDeleteBin6Line className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onAdd={handleAddStock}
      />
    </div>
  );
}

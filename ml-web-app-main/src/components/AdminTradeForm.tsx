"use client";

import axiosInstance from "@/lib/axios";
import { Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

// Define the props interface for the TradeForm component
interface TradeFormProps {
  theme: "dark" | "light";
  searchTerm?: string;
  selectedDate?: string;
}

interface SymbolSchema{
  id: number;
  symbol: string;
}

// Define the type for the symbol data
interface SymbolData {
  id?: number;
  adj_buy_price?: string;
  buy_date: string;
  buy_price: string;
  buy_range?: string;
  current_strategy: string;
  point_change: string;
  profit_loss_pct: string;
  risk_reward_ratio: string;
  sell_range: string;
  signal: string;
  sold_date?: string;
  sold_price?: string;
  symbol?: string;
  stop_loss: string;
  trade_result?: string;
}

// TradeForm Component
export const TradeForm: React.FC<TradeFormProps> = ({ theme }) => {
  // Mock data with explicit typing
  const symbolData: { [key: string]: SymbolData } = {};

  // State with proper TypeScript types
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NEPSE");
  const [formData, setFormData] = useState<SymbolData | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<SymbolSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Theme-based styling consistent with sidebar
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const inputBgColor = theme === "dark" ? "bg-dark-light" : "bg-gray-50";
 // const hoverBgColor = theme === "dark" ? "hover:bg-dark-light" : "hover:bg-gray-100";
  const cardBg = theme === "dark" ? "bg-dark-light" : "bg-gray-50";

  const transformData = (responseData: SymbolData):SymbolData => {
    const transformedData = {
          id: responseData.id ? responseData.id : undefined,
          adj_buy_price: responseData.adj_buy_price ?? undefined,
          buy_date: responseData.buy_date ?? undefined,
          buy_price: responseData.buy_price ?? undefined,
          buy_range: responseData.buy_range ?? undefined,
          current_strategy: responseData.current_strategy,
          point_change: responseData.point_change,
          profit_loss_pct: responseData.profit_loss_pct,
          risk_reward_ratio: responseData.risk_reward_ratio,
          sell_range: responseData.sell_range,
          signal: responseData.signal,
          sold_date: responseData.sold_date ?? undefined,
          sold_price: responseData.sold_price ?? undefined,
          symbol: responseData.symbol ?? undefined,
          stop_loss: responseData.stop_loss ?? undefined,
          trade_result: responseData.trade_result ?? undefined,
      };
    return transformedData;
  }

  // Handle symbol change
  const handleSymbolChange = async (symbol: string) => {
    //setIsLoading(true);
    console.log("Handle symbole change", symbol);
    setSelectedSymbol(symbol);

    const response = await axiosInstance.get(`/api/ai-signals/${symbol}/${selectedDate}`);
    console.log(response.data.data);
    const responseData = response.data.data;
    if(responseData){
      const transformedData = transformData(responseData);
      console.log(transformedData)
      setFormData(transformedData);
    }
    else{
      setFormData(null);
    }
    setEditMode(false);
    setIsLoading(false);
  };

  // Fetch symbol
  const fetchSymbolAsync = async () => {
    const response = await axiosInstance.get(
        `/api/symbols`
      );

    console.log(response);
    setSymbols(response.data.data);
  }

  // Handle input change
  const handleInputChange = async (field: keyof SymbolData, value: string) => {
    setFormData((prev) => {
      // If prev is null, initialize with default SymbolData
      const defaultData: SymbolData = {
        id: undefined,
        symbol: selectedSymbol || undefined,
        signal: "",
        buy_date: "",
        buy_price: "",
        adj_buy_price: undefined,
        sold_date: undefined,
        sold_price: undefined,
        current_strategy: "",
        point_change: "",
        profit_loss_pct: "",
        buy_range: undefined,
        sell_range: "",
        risk_reward_ratio: "",
        stop_loss: "",
        trade_result: undefined,
      };
      return {
        ...(prev || defaultData),
        [field]: value, // Convert empty string to undefined
      };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    //setIsLoading(true);
    if (selectedSymbol) {
      console.log("Updated data for", selectedSymbol, formData);
      const response = await axiosInstance.post(
        `/api/ai-signals/updateAISignal`, formData
      );

      console.log(response);
      if(response.data.data){
        const transformedData = transformData(response.data.data);
        setFormData(transformedData);
      }
      else{
        setFormData(null);
      }
      setEditMode(false);
    }
    setIsLoading(false);
  };

  // Filter functions
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Get today's date in yyyy-MM-dd format
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Set today's date on component mount
    const date = getTodaysDate();
    setSelectedDate(date);
    fetchSymbolAsync();
    //handleSymbolChange("NEPSE");
  },[])

  interface LoaderOverlayProps {
    isVisible: boolean;
    theme: "dark" | "light";
  }

  const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ isVisible, theme }) => {
    if (!isVisible) return null;
  
    const overlayBg = theme === "dark" ? "bg-black bg-opacity-50" : "bg-white bg-opacity-50";
    const loaderBg = theme === "dark" ? "bg-dark-default" : "bg-white";
    const loaderTextColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayBg}`}>
        <div className={`${loaderBg} p-6 rounded-lg shadow-lg flex flex-col items-center gap-3`}>
          <Loader2 className={`w-8 h-8 animate-spin ${loaderTextColor}`} />
          <p className={`${loaderTextColor} text-sm font-medium`}>Loading...</p>
        </div>
      </div>
    );
  };
  
  // Render input field
  const renderField = (label: string, field: keyof SymbolData, type: string = "text") => (
    <div className="mb-4">
      <LoaderOverlay isVisible={isLoading} theme={theme} />
      {formData && Object.keys(formData).length > 0 ? (
        <>
          <label className={`block text-sm font-medium mb-2 ${textColor}`}>
            {label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
          <input
            type={type}
            value={formData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={!editMode}
            className={`w-full p-3 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </>
      ) : ""
    }
    </div>
  );

  return (
    <div className={`${bgColor} min-h-screen p-6`}>
      {/* Header Section */}
      <div className={`mb-6 border-b ${borderColor} pb-4`}>
        <h1 className={`text-2xl font-bold ${textColor} mb-2`}>AI Signals Management</h1>
        <p className={`text-sm ${textColor} opacity-70`}>
          Manage and configure AI-generated trading signals
        </p>
      </div>

      {/* Combined Filter Section */}
      <div className={`mb-6 border ${borderColor} rounded-lg p-4 ${cardBg}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          {/* Symbol Filter */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Select Symbol</h3>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">-- Select a Symbol --</option>
              {symbols.map((symbol) => (
                <option key={symbol.id} value={symbol.symbol}>
                  {symbol.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Date Filter</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className={`h-4 w-4 ${textColor} opacity-50`} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className={`w-full pl-10 pr-3 py-3 border ${borderColor} rounded-lg ${inputBgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Apply Filter Button */}
          <div>
            <button
              onClick={() => handleSymbolChange(selectedSymbol)}
              disabled={!selectedSymbol}
              className={`w-32 p-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${!selectedSymbol 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              Apply Filters
            </button>
          </div>
        </div>
    </div>

      {/* Signal Details */}
      {selectedSymbol && (
        <div className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textColor}`}>
              Signal Details - {selectedSymbol}
            </h3>
            {formData && Object.keys(formData).length > 0 ? (
            <div className="flex gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      if (symbolData[selectedSymbol]) {
                        setFormData(symbolData[selectedSymbol]);
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>) : ""}
          </div>
          {formData && Object.keys(formData).length > 0 ?
          (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Signal", "signal")}
            {renderField("Buy Date", "buy_date", "date")}
            {renderField("Buy Price", "buy_price", "number")}
            {renderField("Adjusted Buy Price", "adj_buy_price", "number")}
            {renderField("Sold Date", "sold_date", "date")}
            {renderField("Sold Price", "sold_price", "number")}
            {renderField("Current Strategy", "current_strategy")}
            {renderField("Point Change", "point_change", "number")}
            {renderField("Profit/Loss %", "profit_loss_pct", "number")}
            {renderField("Buy Range", "buy_range")}
            {renderField("Sell Range", "sell_range")}
            {renderField("Risk Reward Ratio", "risk_reward_ratio")}
            {renderField("Stop Loss", "stop_loss")}
            {renderField("Trade Result", "trade_result")}
          </div>) : (
              <div className={`text-center py-8 ${textColor}`}>
                <p className="text-lg font-medium">No AI Signal</p>
                <p className="text-sm opacity-70 mt-2">No signal data available for this symbol</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
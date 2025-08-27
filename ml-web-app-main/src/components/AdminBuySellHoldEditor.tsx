"use client";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BuySellHoldEditorProps {
  theme: "dark" | "light";
}

interface SymbolSchema {
  id: number;
  symbol: string;
}

interface SignalData {
  id?: number;
  symbol?: string;
  signal: string;
  confidence?: number;
  price?: string;
  created_at?: string;
  updated_at?: string;
}

// Buy/Sell/Hold Signals Component
export const BuySellHoldEditor: React.FC<BuySellHoldEditorProps> = ({ theme }) => {
  // State with proper TypeScript types
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [symbols, setSymbols] = useState<SymbolSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Theme-based styling consistent with AdminTradeForm
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const inputBgColor = theme === "dark" ? "bg-dark-light" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-dark-light" : "bg-gray-50";

  const transformData = (responseData: SignalData): SignalData => {
    return {
      id: responseData.id ? responseData.id : undefined,
      symbol: responseData.symbol ?? undefined,
      signal: responseData.signal || "",
      confidence: responseData.confidence ?? undefined,
      price: responseData.price ?? undefined,
      created_at: responseData.created_at ?? undefined,
      updated_at: responseData.updated_at ?? undefined,
    };
  };

  // Handle symbol change
  const handleSymbolChange = async (symbol: string) => {
    setIsLoading(true);
    console.log("Handle symbol change", symbol);
    setSelectedSymbol(symbol);

    try {
      const response = await axiosInstance.get(`/api/signals/getTradingSignal/${symbol}`);
      console.log(response.data.data);
      const responseData = response.data.data;
      if (responseData) {
        const transformedData = transformData(responseData);
        console.log(transformedData);
        setSignalData(transformedData);
      } else {
        // Set default data if no signal exists
        setSignalData({
          symbol: symbol,
          signal: "",
          confidence: undefined,
          price: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching signal data:", error);
      setSignalData({
        symbol: symbol,
        signal: "",
        confidence: undefined,
        price: undefined,
      });
    }
    setIsLoading(false);
  };

  // Fetch symbols
  const fetchSymbolAsync = async () => {
    try {
      const response = await axiosInstance.get(`/api/symbols`);
      console.log(response);
      setSymbols(response.data.data);
    } catch (error) {
      console.error("Error fetching symbols:", error);
    }
  };

  // Handle signal selection
  const handleSignalSelect = async (signal: string) => {
    if (!selectedSymbol) return;

    setIsLoading(true);
    const updatedData = { ...signalData, signal: signal };
    setSignalData(updatedData);

    try {
      const response = await axiosInstance.post(`/api/signals/updateTradingSignal`, {
        ...updatedData,
        symbol: selectedSymbol,
      });
      console.log("Signal updated:", response.data);
      if (response.data.data) {
        const transformedData = transformData(response.data.data);
        setSignalData(transformedData);
      }
    } catch (error) {
      console.error("Error updating signal:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSymbolAsync();
  }, []);

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

  const getSignalButtonStyle = (signal: string, currentSignal: string) => {
    const isActive = currentSignal === signal;
    const baseStyle = "px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      switch (signal) {
        case "BUY":
          return `${baseStyle} bg-green-600 text-white border-2 border-green-500`;
        case "SELL":
          return `${baseStyle} bg-red-600 text-white border-2 border-red-500`;
        case "HOLD":
          return `${baseStyle} bg-yellow-600 text-white border-2 border-yellow-500`;
        default:
          return `${baseStyle} ${inputBgColor} ${textColor} border-2 ${borderColor}`;
      }
    } else {
      return `${baseStyle} ${inputBgColor} ${textColor} border-2 ${borderColor} hover:bg-opacity-80`;
    }
  };

  return (
    <div className={`${bgColor} min-h-screen p-6`}>
      <LoaderOverlay isVisible={isLoading} theme={theme} />
      
      {/* Header Section */}
      <div className={`mb-6 border-b ${borderColor} pb-4`}>
        <h1 className={`text-2xl font-bold ${textColor} mb-2`}>Buy/Sell/Hold Signals Management</h1>
        <p className={`text-sm ${textColor} opacity-70`}>
          Manage and configure buy, sell, and hold trading signals
        </p>
      </div>

      {/* Filter Section */}
      <div className={`mb-6 border ${borderColor} rounded-lg p-4 ${cardBg}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
          {/* Symbol Filter */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Select Symbol</h3>
            <select
              value={selectedSymbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
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

          {/* Apply Filter Button */}
          {/* <div>
            <button
              onClick={() => handleSymbolChange(selectedSymbol)}
              disabled={!selectedSymbol}
              className={`w-32 p-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${!selectedSymbol 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              Apply Filter
            </button>
          </div> */}
        </div>
      </div>

      {/* Signal Details */}
      {selectedSymbol && (
        <div className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>
              Signal Management - {selectedSymbol}
            </h3>
            
            {signalData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Signal Info */}
                <div>
                  <h4 className={`text-md font-medium mb-4 ${textColor}`}>Current Signal Information</h4>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
                      <span className={`text-sm ${textColor} opacity-70`}>Symbol:</span>
                      <p className={`font-medium ${textColor}`}>{selectedSymbol}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
                      <span className={`text-sm ${textColor} opacity-70`}>Current Signal:</span>
                      <p className={`font-medium ${
                        signalData.signal === 'BUY' ? 'text-green-500' :
                        signalData.signal === 'SELL' ? 'text-red-500' :
                        signalData.signal === 'HOLD' ? 'text-yellow-500' :
                        textColor
                      }`}>
                        {signalData.signal || 'No Signal Set'}
                      </p>
                    </div>
                    {signalData.confidence && (
                      <div className={`p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
                        <span className={`text-sm ${textColor} opacity-70`}>Confidence:</span>
                        <p className={`font-medium ${textColor}`}>{signalData.confidence}%</p>
                      </div>
                    )}
                    {signalData.price && (
                      <div className={`p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
                        <span className={`text-sm ${textColor} opacity-70`}>Price:</span>
                        <p className={`font-medium ${textColor}`}>Rs. {signalData.price}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signal Selection */}
                <div>
                  <h4 className={`text-md font-medium mb-4 ${textColor}`}>Select Signal</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSignalSelect('BUY')}
                      className={getSignalButtonStyle('BUY', signalData.signal)}
                      disabled={isLoading}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => handleSignalSelect('HOLD')}
                      className={getSignalButtonStyle('HOLD', signalData.signal)}
                      disabled={isLoading}
                    >
                      HOLD
                    </button>
                    <button
                      onClick={() => handleSignalSelect('SELL')}
                      className={getSignalButtonStyle('SELL', signalData.signal)}
                      disabled={isLoading}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${textColor}`}>
                <p className="text-lg font-medium">No Signal Data</p>
                <p className="text-sm opacity-70 mt-2">No signal data available for this symbol</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
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

interface SymbolSchema {
  id: number;
  symbol: string;
}

// Define the type for the symbol data (API response and form data)
interface SymbolData {
  id?: number;
  symbol?: string;
  date?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signal?: any;
  direction?: string;
  entry_price?: number | null;
  exit_price?: number | null;
  exit_reason?: string | null;
  extras?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  quantity?: number | null;
  status?: string;
  stop_price?: number | null;
  tp_high?: number | null;
  tp_low?: number | null;
  confidence?: number | null;
}

// Define the type for the API response, where signal is a number
interface ApiSymbolData {
  id?: number;
  symbol?: string;
  date?: string;
  signal?: number;
  direction?: string;
  entry_price?: number | null;
  exit_price?: number | null;
  exit_reason?: string | null;
  extras?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  quantity?: number | null;
  status?: string;
  stop_price?: number | null;
  tp_high?: number | null;
  tp_low?: number | null;
  confidence?: number | null;
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
  const cardBg = theme === "dark" ? "bg-dark-light" : "bg-gray-50";

  const transformData = (responseData: ApiSymbolData): SymbolData => {
    return {
      id: responseData.id ?? undefined,
      symbol: responseData.symbol ?? undefined,
      date: responseData.date ?? undefined,
      signal: responseData.signal === 1 ? "BUY" : responseData.signal === -1 ? "SELL" : responseData.signal === 0 ? "HOLD" : undefined,
      direction: responseData.direction ?? undefined,
      entry_price: responseData.entry_price ?? undefined,
      exit_price: responseData.exit_price ?? undefined,
      exit_reason: responseData.exit_reason ?? undefined,
      extras: responseData.extras ?? undefined,
      opened_at: responseData.opened_at ?  new Date(responseData.opened_at).toISOString().split("T")[0]: undefined,
      closed_at: responseData.closed_at ? new Date(responseData.closed_at).toISOString().split("T")[0] : undefined,
      quantity: responseData.quantity ?? undefined,
      status: responseData.status ?? undefined,
      stop_price: responseData.stop_price ?? undefined,
      tp_high: responseData.tp_high ?? undefined,
      tp_low: responseData.tp_low ?? undefined,
      confidence: responseData.confidence ?? undefined,
    };
  };

  // Handle symbol change
  const handleSymbolChange = async (symbol: string) => {
    setIsLoading(true);
    console.log("Handle symbol change", symbol);
    setSelectedSymbol(symbol);

    const date = selectedDate || getTodaysDate();
    const response = await axiosInstance.get(`/api/ai-signals/${symbol}/${date}`);
    console.log(response.data.data);
    const responseData: ApiSymbolData = response.data.data;
    if (responseData) {
      const transformedData = transformData(responseData);
      console.log(transformedData);
      setFormData(transformedData);
    } else {
      setFormData(null);
    }
    setEditMode(false);
    setIsLoading(false);
  };

  // Fetch symbols
  const fetchSymbolAsync = async () => {
    const response = await axiosInstance.get(`/api/symbols`);
    console.log(response);
    setSymbols(response.data.data);
  };

  // Handle input change for text, number, and select fields
  const handleInputChange = (field: keyof SymbolData, value: string | number | null) => {
    setFormData((prev) => {
      const defaultData: SymbolData = {
        id: undefined,
        symbol: selectedSymbol || undefined,
        date: selectedDate || undefined,
        signal: undefined,
        direction: undefined,
        entry_price: null,
        exit_price: null,
        exit_reason: null,
        extras: null,
        opened_at: null,
        closed_at: null,
        quantity: null,
        status: undefined,
        stop_price: null,
        tp_high: null,
        tp_low: null,
        confidence: null,
      };
      return {
        ...(prev || defaultData),
        [field]: value === "" ? null : value,
      };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    if (selectedSymbol && formData) {
      // Convert signal back to numeric for API
      // const submitData:ApiSymbolData = {
      //   ...formData,
      //   signal: formData.signal === "BUY" ? 1 : formData.signal === "SELL" ? -1 : formData.signal === "HOLD" ? 0 : undefined,
      // };
      console.log("Updated data for", selectedSymbol, formData);
      const response = await axiosInstance.post(`/api/ai-signals/updateAISignal`, formData);
      console.log(response);
      if (response.data.data) {
        const transformedData = transformData(response.data.data);
        setFormData(transformedData);
      } else {
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
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const date = getTodaysDate();
    setSelectedDate(date);
    fetchSymbolAsync();
    handleSymbolChange('NEPSE');
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

  // Render input field
  const renderField = (
    label: string,
    field: keyof SymbolData,
    type: string = "text",
    options?: string[]
  ) => (
    <div className="mb-4">
      <LoaderOverlay isVisible={isLoading} theme={theme} />
      {formData && Object.keys(formData).length > 0 ? (
        <>
          <label className={`block text-sm font-medium mb-2 ${textColor}`}>
            {label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
          {options ? (
            <select
              value={formData[field] || ""}
              onChange={(e) => handleInputChange(field, e.target.value || null)}
              disabled={!editMode}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <option value="">-- Select --</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={formData[field] ?? ""}
              onChange={(e) => handleInputChange(field, type === "number" ? (isNaN(parseFloat(e.target.value)) ? null : parseFloat(e.target.value)) : e.target.value || null)}
              disabled={!editMode}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBgColor} ${textColor} text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          )}
        </>
      ) : ""}
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
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
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
              </div>
            ) : ""}
          </div>
          {formData && Object.keys(formData).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("Signal", "signal", "select", ["HOLD", "SELL", "BUY"])}
              {renderField("Direction", "direction", "select", ["LONG", "SHORT"])}
              {renderField("Status", "status", "select", ["RUNNING", "SUCCESS", "STOP_LOSS", "CANCELLED"])}
              {renderField("Entry Price", "entry_price", "number")}
              {renderField("Exit Price", "exit_price", "number")}
              {renderField("Exit Reason", "exit_reason")}
              {renderField("Extras", "extras")}
              {renderField("Opened At", "opened_at", "date")}
              {renderField("Closed At", "closed_at", "date")}
              {renderField("Quantity", "quantity", "number")}
              {renderField("Stop Price", "stop_price", "number")}
              {renderField("Take Profit High", "tp_high", "number")}
              {renderField("Take Profit Low", "tp_low", "number")}
              {renderField("Confidence", "confidence", "number")}
            </div>
          ) : (
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
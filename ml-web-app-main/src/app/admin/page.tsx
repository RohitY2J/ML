"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ChevronLeft, ChevronRight, Lightbulb, Users, TrendingUp, Bot } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { AISignal } from "@/services/api/aiSignals";

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


interface SymbolSchema{
  id: number;
  symbol: string;
}

// Define the props interface for the TradeForm component
interface TradeFormProps {
  theme: "dark" | "light";
}

// TradeForm Component
const TradeForm: React.FC<TradeFormProps> = ({ theme }) => {
  // Mock data with explicit typing
  const symbolData: { [key: string]: SymbolData } = {};

  // State with proper TypeScript types
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NEPSE");
  const [formData, setFormData] = useState<SymbolData | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<SymbolSchema[]>([]);

  // Tailwind CSS classes based on theme
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const cardBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";
  const inputBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";

  // Handle symbol change
  const handleSymbolChange = async (symbol: string) => {
    console.log(symbol);
    setSelectedSymbol(symbol);

    const response = await axiosInstance.get(`/api/ai-signals/${symbol}`);
    console.log(response.data.data);
    const responseData = response.data.data;
    if(responseData){
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
      console.log(transformedData)
      setFormData(transformedData);
    }
    else{
      setFormData(null);
    }
    setEditMode(false);
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
  const handleSubmit = () => {
    if (selectedSymbol) {
      console.log("Updated data for", selectedSymbol, formData);
      setEditMode(false);
    }
  };

  useEffect(() => {
    fetchSymbolAsync();
    handleSymbolChange("NEPSE");
  },[])

  // Render input field
  const renderField = (label: string, field: keyof SymbolData, type: string = "text") => (
    <div className="mb-4">
      {formData && Object.keys(formData).length > 0 ? (
        <>
          <label className={`block text-sm font-medium mb-2 ${textColor}`}>
            {label.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </label>
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={!editMode}
            className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </>
      ) : ""
    }
    </div>
  );

  return (
    <div className={`p-6 ${bgColor} h-full overflow-y-auto`}>
      <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>AI Signals Configuration</h2>

      {/* Symbol Filter */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor} mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Select Symbol</h3>
        <select
          value={selectedSymbol}
          onChange={(e) => handleSymbolChange(e.target.value)}
          className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="">-- Select a Symbol --</option>
          {symbols.map((symbol) => (
            <option key={symbol.id} value={symbol.symbol}>
              {symbol.symbol}
            </option>
          ))}
        </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                <p className="text-lg">No AI Signal</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [users, setUsers] = useState([
    { id: 1, email: "user1@example.com", role: "admin" },
    { id: 2, email: "user2@example.com", role: "user" },
  ]);

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const inputBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";

  const handleAddUser = () => {
    if (email) {
      setUsers([...users, { id: Date.now(), email, role }]);
      setEmail("");
      setRole("user");
    }
  };

  return (
    <div className={`p-6 ${bgColor} h-full`}>
      <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>User Management</h2>

      {/* Add User Form */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor} mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Add New User</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <button
            onClick={handleAddUser}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Existing Users</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${borderColor}`}
            >
              <div>
                <span className={`${textColor} font-medium`}>{user.email}</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "moderator"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Buy/Sell/Hold Signals Component
const BuySellHoldEditor = () => {
  const { theme } = useTheme();
  const [signals, setSignals] = useState([
    { id: 1, symbol: "NEPSE", signal: "BUY", confidence: 85, price: 2450 },
    { id: 2, symbol: "NABIL", signal: "HOLD", confidence: 70, price: 1200 },
    { id: 3, symbol: "NICA", signal: "SELL", confidence: 60, price: 850 },
  ]);

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const cardBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY":
        return "text-green-500";
      case "SELL":
        return "text-red-500";
      case "HOLD":
        return "text-yellow-500";
      default:
        return textColor;
    }
  };

  return (
    <div className={`p-6 ${bgColor} h-full`}>
      <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>Buy/Sell/Hold Signals</h2>

      <div className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Current Signals</h3>
        <div className="space-y-4">
          {signals.map((signal) => (
            <div key={signal.id} className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-lg ${textColor}`}>{signal.symbol}</span>
                <span className={`font-bold text-lg ${getSignalColor(signal.signal)}`}>
                  {signal.signal}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`${textColor}`}>Price: Rs. {signal.price}</span>
                <span className={`${textColor}`}>Confidence: {signal.confidence}%</span>
                <button className="ml-auto text-blue-500 hover:text-blue-700 text-sm">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Add New Signal
        </button>
      </div>
    </div>
  );
};

// AISignalsEditor Component
const AISignalsEditor: React.FC = () => {
  const { theme } = useTheme();
  return <TradeForm theme={theme} />;
};

// Main Admin Page Component
export default function AdminPage() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("users");

  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const sidebarBg = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const hoverBg = theme === "dark" ? "hover:bg-[#2A2E39]" : "hover:bg-gray-100";
  const activeSidebarStyle = theme === "dark" ? "bg-gray-700" : "bg-blue-600"; 


  const menuItems = [
    { id: "users", label: "User Management", icon: Users },
    { id: "signals", label: "Buy/Sell/Hold", icon: TrendingUp },
    { id: "ai", label: "AI Signals", icon: Bot },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "signals":
        return <BuySellHoldEditor />;
      case "ai":
        return <AISignalsEditor />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className={`flex h-screen ${bgColor}`}>
      {/* Sidebar */}
      <div
        className={`${sidebarBg} border-r ${borderColor} transition-all duration-300 ${
          isSidebarExpanded ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarExpanded && (
            <h1 className={`text-xl font-bold ${textColor}`}>Admin Panel</h1>
          )}
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`p-2 rounded-lg ${hoverBg} ${textColor}`}
          >
            {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg ${hoverBg} ${textColor} transition-colors ${
                  activeSection === item.id ? `${activeSidebarStyle} text-blue-600` : ""
                }`}
              >
                <IconComponent size={20} />
                {isSidebarExpanded && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        {/* <div className="absolute bottom-4 left-2 right-2">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${hoverBg} ${textColor} transition-colors`}
          >
            <Lightbulb size={20} />
            {isSidebarExpanded && <span>Theme</span>}
          </button>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Users, TrendingUp, Bot } from "lucide-react";
import {
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "react-icons/ri";
import { AISignalsEditor } from "@/components/AdminAISignalsEditor";
import { BuySellHoldEditor } from "@/components/AdminBuySellHoldEditor";

// Main Admin Page Component
export default function AdminPage() {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("signals");

  // Theme-based styling using same pattern as Sidebar.tsx
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const hoverBgColor = theme === "dark" ? "hover:bg-dark-light" : "hover:bg-gray-100";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    //{ id: "users", label: "User Management", icon: Users },
    { id: "signals", label: "Buy/Sell/Hold", icon: TrendingUp },
    { id: "ai", label: "AI Signals", icon: Bot },
  ];

  const renderContent = () => {
    switch (activeSection) {
      // case "users":
      //   return <UserManagement />;
      case "signals":
        return <BuySellHoldEditor theme={theme}/>;
      case "ai":
        return <AISignalsEditor />;
      default:
        return <BuySellHoldEditor theme={theme} />;
    }
  };

  return (
    <div className={`flex h-screen ${bgColor}`}>
      {/* Sidebar */}
      <div
        className={`${bgColor} h-screen ${
          isCollapsed ? "w-20" : "w-60"
        } transition-all duration-300 border-r ${borderColor} flex flex-col`}
      >
        {/* Logo Section */}
        <div className={`p-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-center">
            {!isCollapsed ? (
              <h1 className={`text-xl font-bold ${textColor}`}>MeroLagani</h1>
            ) : (
              <h1 className={`text-xl font-bold ${textColor}`}>ML</h1>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          <div>
            <div className={`px-4 py-2 ${textColor} text-sm font-medium opacity-70`}>
              {!isCollapsed && "Admin Panel"}
            </div>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } px-4 py-2.5 ${hoverBgColor} ${textColor} ${
                    activeSection === item.id ? "bg-opacity-10 font-medium" : "font-normal"
                  }`}
                >
                  <span className="flex-shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </span>
                  {!isCollapsed && <span className="ml-3 text-sm">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Collapse Button at Bottom */}
        <div className={`p-4 border-t ${borderColor}`}>
          <button
            onClick={handleCollapse}
            className={`w-full flex items-center justify-center p-2 rounded-lg ${hoverBgColor} ${textColor}`}
          >
            {isCollapsed ? (
              <RiMenuUnfoldLine className="w-5 h-5" />
            ) : (
              <RiMenuFoldLine className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}
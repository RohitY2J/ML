"use client";

import { useTheme } from "@/context/ThemeContext";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";

export default function PackageDetails() {
  const { theme } = useTheme();
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const cardBgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-white";

  // Mock data - replace with actual data from your backend
  const currentPackage = {
    name: "Premium",
    price: "NPR 3000",
    period: "month",
    expiryDate: "2024-04-20",
    features: [
      { name: "Real-time Market Data", included: true },
      { name: "Advanced Charting Tools", included: true },
      { name: "Portfolio Analytics", included: true },
      { name: "News Alerts", included: true },
      { name: "API Access", included: true },
      { name: "Priority Support", included: true },
      { name: "Custom Indicators", included: true },
      { name: "Multiple Portfolios", included: true },
    ],
  };

  const availablePackages = [
    {
      name: "Basic",
      price: "NPR 1200",
      period: "month",
      features: [
        { name: "Real-time Market Data", included: true },
        { name: "Basic Charting Tools", included: true },
        { name: "Portfolio Analytics", included: false },
        { name: "News Alerts", included: false },
        { name: "API Access", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Indicators", included: false },
        { name: "Multiple Portfolios", included: false },
      ],
    },
    {
      name: "Premium",
      price: "NPR 3000",
      period: "month",
      features: [
        { name: "Real-time Market Data", included: true },
        { name: "Advanced Charting Tools", included: true },
        { name: "Portfolio Analytics", included: true },
        { name: "News Alerts", included: true },
        { name: "API Access", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Indicators", included: true },
        { name: "Multiple Portfolios", included: true },
      ],
    },
    {
      name: "Enterprise",
      price: "NPR 12000",
      period: "month",
      features: [
        { name: "Real-time Market Data", included: true },
        { name: "Advanced Charting Tools", included: true },
        { name: "Portfolio Analytics", included: true },
        { name: "News Alerts", included: true },
        { name: "API Access", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Indicators", included: true },
        { name: "Multiple Portfolios", included: true },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className="max-sm:p-4">
        <h1 className={`text-xl font-medium mb-4 ${textColor} lg:hidden`}>Package Details</h1>
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-2rem)]">
          {/* Left Sidebar - Current Package */}
          <div
            className={`w-full lg:w-[390px] lg:min-w-[329px] lg:shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r ${borderColor} p-4 lg:p-6 mb-4 lg:mb-0`}
          >
            <div className="space-y-4 lg:space-y-6">
              <div className={`${cardBgColor} rounded-lg p-4 lg:p-6 shadow-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className={`text-lg lg:text-xl font-medium ${textColor}`}>Current Package</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm w-fit">
                    Active
                  </span>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textColor} opacity-70`}>Package Type</span>
                    <span className={`text-sm ${textColor} font-medium`}>{currentPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textColor} opacity-70`}>Valid Until</span>
                    <span className={`text-sm ${textColor} font-medium`}>
                      {currentPackage.expiryDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textColor} opacity-70`}>Price</span>
                    <span className={`text-sm ${textColor} font-medium`}>
                      {currentPackage.price}/{currentPackage.period}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Package Features - Hidden on larger screens, shown on mobile */}
              <div className={`${cardBgColor} rounded-lg p-4 lg:hidden`}>
                <h3 className={`text-base font-medium mb-4 ${textColor}`}>Current Features</h3>
                <div className="space-y-3">
                  {currentPackage.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-2">
                      {feature.included ? (
                        <RiCheckLine className={`w-4 h-4 text-green-500 shrink-0`} />
                      ) : (
                        <RiCloseLine className={`w-4 h-4 text-red-500 shrink-0`} />
                      )}
                      <span className={`text-sm ${textColor}`}>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Available Packages */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className={`text-xl font-medium mb-6 lg:mb-8 ${textColor} hidden lg:block`}>Available Packages</h1>
              <h2 className={`text-lg font-medium mb-4 ${textColor} lg:hidden`}>Choose a Package</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {availablePackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`${cardBgColor} rounded-lg p-4 lg:p-6 ${
                      pkg.name === currentPackage.name ? "ring-2 ring-blue-500" : ""
                    } shadow-sm`}
                  >
                      <h2 className={`text-base font-medium ${textColor}`}>{pkg.name}</h2>
                      
                    <div className="mb-4 lg:mb-6">
                      <span className={`text-xl lg:text-2xl font-medium ${textColor}`}>{pkg.price}</span>
                      <span className={`text-sm ${textColor} opacity-70`}>/{pkg.period}</span>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                      {pkg.features.map((feature) => (
                        <div key={feature.name} className="flex items-start gap-2">
                          {feature.included ? (
                            <RiCheckLine className={`w-4 h-4 text-green-500 shrink-0 mt-0.5`} />
                          ) : (
                            <RiCloseLine className={`w-4 h-4 text-red-500 shrink-0 mt-0.5`} />
                          )}
                          <span className={`text-sm ${textColor} leading-relaxed`}>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      className={`w-full py-2 lg:py-2.5 rounded-lg text-sm font-medium ${
                        pkg.name === currentPackage.name
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      disabled={pkg.name === currentPackage.name}
                    >
                      {pkg.name === currentPackage.name ? "Current Package" : "Upgrade"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
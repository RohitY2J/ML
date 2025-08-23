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
    <div className={`h-[calc(100vh)] ${bgColor}`}>
      <div className="flex h-[calc(100vh)]">
        <div
          className={`shrink-0 w-[390px] min-w-[329px] overflow-y-auto border-r ${borderColor} p-6`}
        >
          <div className="space-y-6">
            <div className={`${cardBgColor} rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-medium ${textColor}`}>Current Package</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Active
                </span>
              </div>
              <div className="space-y-4">
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
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-xl font-medium mb-8 ${textColor}`}>Available Packages</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`${cardBgColor} rounded-lg p-6 ${
                    pkg.name === currentPackage.name ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <h2 className={`text-base font-medium mb-2 ${textColor}`}>{pkg.name}</h2>
                  <div className="mb-6">
                    <span className={`text-2xl font-medium ${textColor}`}>{pkg.price}</span>
                    <span className={`text-sm ${textColor} opacity-70`}>/{pkg.period}</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2">
                        {feature.included ? (
                          <RiCheckLine className={`w-4 h-4 text-green-500`} />
                        ) : (
                          <RiCloseLine className={`w-4 h-4 text-red-500`} />
                        )}
                        <span className={`text-sm ${textColor}`}>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-medium ${
                      pkg.name === currentPackage.name
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition-colors`}
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
  );
}

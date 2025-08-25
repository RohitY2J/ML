"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axios";

interface ChartControlsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widget: any;
  currentSymbol?: string;
}

interface Zone {
  zone_number: number;
  bottom_price: string;
  center_price: string;
  top_price: string;
}

interface Trendline {
  start_date: string;
  end_date: string;
  start_price: string;
  end_price: string;
  type: "support" | "resistance";
  strength: number;
}

interface ZonesResponse {
  symbol: string;
  timeframe_days: number;
  support_zones: Zone[];
  resistance_zones: Zone[];
}

interface TrendlinesResponse {
  symbol: string;
  timeframe_days: number;
  trendlines: Trendline[];
}

const ChartControls: React.FC<ChartControlsProps> = ({
  widget,
  currentSymbol = "NEPSE",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSupportZones, setShowSupportZones] = useState(false);
  const [showResistanceZones, setShowResistanceZones] = useState(false);
  const [showTrendlines, setShowTrendlines] = useState(true);
  const [zonesData, setZonesData] = useState<ZonesResponse | null>(null);
  const [trendlinesData, setTrendlinesData] =
    useState<TrendlinesResponse | null>(null);
  const [shapeIds, setShapeIds] = useState<string[]>([]);
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  // Function to fetch data
  const fetchData = async () => {
    if (!widget) return;
    setIsLoading(true);
    try {
      // Fetch support and resistance zones
      const zonesResponse = await axiosInstance.get(
        `/api/zones/${currentSymbol}`,
        {
          params: { timeframe: 90 },
        }
      );
      setZonesData(zonesResponse.data.data);

      // Fetch trendlines
      const trendlinesResponse = await axiosInstance.get(
        `/api/trendlines/${currentSymbol}`,
        {
          params: { timeframe: 90 },
        }
      );
      setTrendlinesData(trendlinesResponse.data.data);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch data when component mounts or symbol changes
  useEffect(() => {
    if (widget) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget, currentSymbol]);

  // Effect to redraw when toggles change
  useEffect(() => {
    if (widget && zonesData && trendlinesData) {
      try {
        const activeChart = widget.activeChart();
        if (!activeChart) {
          return;
        }
        console.log(shapeIds);
        
        // Clear existing shapes
        activeChart.removeAllShapes();
        // Get the visible range of the chart
        const visibleRange = activeChart.getVisibleRange();
        const startTime = visibleRange.from;
        const endTime = visibleRange.to;
        // Draw support zones if enabled
        if (showSupportZones && zonesData.support_zones) {
          zonesData.support_zones.forEach((zone: Zone) => {
            activeChart.createMultipointShape(
              [
                { time: startTime, price: parseFloat(zone.top_price) },
                { time: endTime, price: parseFloat(zone.bottom_price) },
              ],
              {
                shape: "rectangle",
                disableSelection: true,
                disableSave: true,
                overrides: {
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(86, 243, 112, 0.3)"
                      : "rgba(86, 243, 112, 0.3)",
                  showLabel: true,
                  text: `Support Zone ${zone.zone_number}`,
                  textcolor:
                    theme === "dark"
                      ? "rgb(207, 215, 196)"
                      : "rgb(207, 215, 196)",
                  fontsize: 12,
                  bold: true,
                  lineStyle: 0,
                  linewidth: 0,
                  showPrice: true,
                  priceLineColor:
                    theme === "dark"
                      ? "rgb(207, 215, 196)"
                      : "rgb(207, 215, 196)",
                  priceLineWidth: 1,
                  priceLineStyle: 0
                },
              }
            );
          });
        }
        // Draw resistance zones if enabled
        if (showResistanceZones && zonesData.resistance_zones) {
          zonesData.resistance_zones.forEach(async (zone: Zone) => {
            const top = Math.max(
              parseFloat(zone.top_price),
              parseFloat(zone.bottom_price)
            );
            const bottom = Math.min(
              parseFloat(zone.top_price),
              parseFloat(zone.bottom_price)
            );
            const buffer = (top - bottom) * 0.1 || 1; // fallback to 1 if zone is flat
            const displayTop = top + buffer;
            const displayBottom = bottom - buffer;

            const id = await activeChart.createMultipointShape(
              [
                { time: startTime, price: displayTop },
                { time: endTime, price: displayBottom },
              ],
              {
                shape: "rectangle",
                disableSelection: true, // Prevent selection/movement
                disableSave: false, // Allow saving (optional)
                hitTest: false, // Disable click/hover interactions
                selectable: false, // Prevent selection
                //lock: true, // Explicitly lock the shape (TradingView-specific)
                overrides: {
                  backgroundColor: "rgba(255,0,0,0.3)", // Red with 30% opacity
                  borderColor: "rgba(0,0,0,0)", // Explicitly transparent border
                  borderWidth: 0, // No border thickness
                  showLabel: true, // Keep label
                  text: `Resistance Zone ${zone.zone_number}`,
                  color: theme === "dark" ? "#f87171" : "#ef4444",
                  fontsize: 16,
                  linewidth: 0,
                  showPrice: false, // Disable price lines to avoid confusion
                  backgroundTransparency: 0.7, // Explicit 30% opacity (TradingView-specific)
                  borderVisible: false, // Explicitly hide border (TradingView-specific)
                },
              }
            );
            setShapeIds((prev) => [...prev, id]);
          });
        }
        // Draw trendlines if enabled
        if (showTrendlines && trendlinesData.trendlines) {
          trendlinesData.trendlines.forEach((trendline: Trendline) => {
            activeChart.createMultipointShape(
              [
                {
                  time: new Date(trendline.start_date).getTime() / 1000,
                  price: parseFloat(trendline.start_price),
                },
                {
                  time: new Date(trendline.end_date).getTime() / 1000,
                  price: parseFloat(trendline.end_price),
                },
              ],
              {
                shape: "trend_line",
                disableSelection: true,
                disableSave: true,
                overrides: {
                  linecolor: theme === "dark" ? "#EBEBEB" : "#666666",
                  linewidth: 1,
                  showLabel: true,
                  textcolor:
                    trendline.type === "support"
                      ? theme === "dark"
                        ? "rgba(207, 215, 196,0.1)"
                        : "rgb(207, 215, 196)"
                      : theme === "dark"
                      ? "rgb(228, 210, 211)"
                      : "rgb(228, 210, 211)",
                  fontsize: 12,
                  bold: false,
                  lineStyle: 0,
                  showPrice: true,
                  priceLineColor:
                    trendline.type === "support"
                      ? theme === "dark"
                        ? "rgb(207, 215, 196)"
                        : "rgb(207, 215, 196)"
                      : theme === "dark"
                      ? "rgb(228, 210, 211)"
                      : "rgb(228, 210, 211)",
                  priceLineWidth: 1,
                  priceLineStyle: 0,
                },
              }
            );
          });
        }
      } catch (error) {
        console.error("Error drawing shapes:", error);
      }
    }
  }, [
    showSupportZones,
    showResistanceZones,
    showTrendlines,
    widget,
    shapeIds,
    zonesData,
    trendlinesData,
    theme,
  ]);

  return (
    <div
      className={`${bgColor} rounded-lg border ${borderColor} p-2 shadow-lg`}
    >
      <div className="flex items-center gap-2">
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => setShowSupportZones(!showSupportZones)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors duration-200 ${
              showSupportZones
                ? "bg-green-500 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            SUPPORT
          </button>
          <button
            onClick={() => setShowResistanceZones(!showResistanceZones)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors duration-200 ${
              showResistanceZones
                ? "bg-red-500 text-white hover:bg-red-700"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            RESISTANCE
          </button>
          <button
            onClick={() => setShowTrendlines(!showTrendlines)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors duration-200 ${
              showTrendlines
                ? "bg-gray-500 text-white hover:bg-gray-700"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            TRENDLINE
          </button>
        </div>
        {isLoading && (
          <div className="text-[10px] text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ChartControls;

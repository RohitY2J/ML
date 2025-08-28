"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import axiosInstance from "@/lib/axios";
import { computeTrendPack } from "@/lib/trendlines";
import type { Bar } from "@/lib/types";

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
  trendline_number: number;
  trend_type: string;
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
  const [showTrendlines, setShowTrendlines] = useState(false);
  const [showIndividualTrendlines, setShowIndividualTrendlines] = useState(false);
  const [zonesData, setZonesData] = useState<ZonesResponse | null>(null);
  const [trendlinesData, setTrendlinesData] = useState<TrendlinesResponse[]>([]);
  const [stockData, setStockData] = useState<Bar[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [computedTrendlines, setComputedTrendlines] = useState<any>(null);

  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  // Function to fetch data
  const fetchData = async () => {
    if (!widget) return;
    setIsLoading(true);
    try {
      // Fetch stock data for trendline computation
      const stockResponse = await axiosInstance.get(`/api/stocks/daily/${currentSymbol}`);
      if (stockResponse.data.success && stockResponse.data.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bars: Bar[] = stockResponse.data.data.map((item: any) => ({
          time: item.date,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume) || 0,
        }));
        setStockData(bars);
        
        // Compute trendlines using the same logic as multi-stock page
        const trendPack = computeTrendPack(bars);
        setComputedTrendlines(trendPack);
      }

      // Fetch support and resistance zones
      const zonesResponse = await axiosInstance.get(
        `/api/zones/${currentSymbol}`,
        {
          params: { timeframe: 90 },
        }
      );
      setZonesData(zonesResponse.data.data);

      // Fetch trendlines for all timeframes (for channels)
      const timeframes = [90, 180, 540, 1095]; // 3M, 6M, 18M, 3Y
      const trendlinesPromises = timeframes.map(timeframe =>
        axiosInstance.get(`/api/trendlines/${currentSymbol}`, {
          params: { timeframe },
        })
      );
      
      const trendlinesResponses = await Promise.all(trendlinesPromises);
      const allTrendlinesData = trendlinesResponses.map(response => response.data.data);
      setTrendlinesData(allTrendlinesData);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch data when component mounts or symbol changes
  useEffect(() => {
    if (widget) {
      // Add a small delay to ensure widget is fully initialized
      const timer = setTimeout(() => {
        fetchData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget, currentSymbol]);

  // Effect to redraw when toggles change
  useEffect(() => {
    if (widget && zonesData && trendlinesData && trendlinesData.length > 0) {
      try {
        // Check if widget is fully initialized
        if (!widget || !widget.activeChart || typeof widget.activeChart !== 'function') {
          console.log('Widget not fully initialized yet');
          return;
        }
        
        const activeChart = widget.activeChart();
        if (!activeChart) {
          console.log('Active chart not available');
          return;
        }
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
                //lock: true,
                disableMove: true,
                overrides: {
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(34, 197, 94, 0.3)",
                  borderColor:
                    theme === "dark"
                      ? "rgb(74, 222, 128)"
                      : "rgb(74, 222, 128)",
                  borderWidth: 2,
                  showLabel: true,
                  text: `Support Zone ${zone.zone_number}`,
                  textcolor:
                    theme === "dark"
                      ? "rgb(74, 222, 128)"
                      : "rgb(74, 222, 128)",
                  fontsize: 12,
                  bold: true,
                  lineStyle: 0,
                  showPrice: true,
                  priceLineColor:
                    theme === "dark"
                      ? "rgb(74, 222, 128)"
                      : "rgb(74, 222, 128)",
                  priceLineWidth: 1,
                  priceLineStyle: 0,
                  linewidth: 0,
                },
              }
            );
          });
        }
        // Draw resistance zones if enabled
        if (showResistanceZones && zonesData.resistance_zones) {
          zonesData.resistance_zones.forEach((zone: Zone) => {
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
            activeChart.createMultipointShape(
              [
                { time: startTime, price: displayTop },
                { time: endTime, price: displayBottom },
              ],
              {
                shape: "rectangle",
                disableSelection: true,
                disableSave: true,
                //lock: true,
                disableMove: true,
                overrides: {
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(239,68,68,0.5)"
                      : "rgba(239,68,68,0.3)",
                  borderColor: theme === "dark" ? "#f87171" : "#ef4444",
                  borderWidth: 0,
                  showLabel: true,
                  text: `Resistance Zone ${zone.zone_number}`,
                  textcolor: theme === "dark" ? "#f87171" : "#ef4444",
                  fontsize: 16,
                  bold: true,
                  lineStyle: 0,
                  showPrice: true,
                  priceLineColor: theme === "dark" ? "#f87171" : "#ef4444",
                  priceLineWidth: 2,
                  priceLineStyle: 0,
                  linewidth: 0,
                },
              }
            );
          });
        }
        // Draw trend channels if enabled
        if (showTrendlines && trendlinesData.length > 0) {
          // Process each timeframe
          trendlinesData.forEach((timeframeData: TrendlinesResponse) => {
            if (!timeframeData.trendlines || timeframeData.trendlines.length === 0) return;
            
            // Group trendlines into channels (upper and lower pairs)
            const channels: { [key: number]: { upper?: Trendline; lower?: Trendline } } = {};
            
            timeframeData.trendlines.forEach((trendline: Trendline) => {
              const channelNumber = Math.ceil(trendline.trendline_number / 2);
              
              if (!channels[channelNumber]) {
                channels[channelNumber] = {};
              }
              
              if (trendline.trend_type === 'upper') {
                channels[channelNumber].upper = trendline;
              } else if (trendline.trend_type === 'lower') {
                channels[channelNumber].lower = trendline;
              }
            });
            
            // Draw each channel for this timeframe
            Object.entries(channels).forEach(([, channel]) => {
              if (channel.upper && channel.lower) {
                const upper = channel.upper;
                const lower = channel.lower;
                
                // Determine timeframe label and color
                let timeframeLabel = '';
                let channelColor = '#3b82f6'; // Default blue
                
                if (timeframeData.timeframe_days === 90) {
                  timeframeLabel = '3M';
                  channelColor = '#3b82f6'; // Blue
                } else if (timeframeData.timeframe_days === 180) {
                  timeframeLabel = '6M';
                  channelColor = '#10b981'; // Green
                } else if (timeframeData.timeframe_days === 540) {
                  timeframeLabel = '18M';
                  channelColor = '#f59e0b'; // Orange
                } else if (timeframeData.timeframe_days === 1095) {
                  timeframeLabel = '3Y';
                  channelColor = '#8b5cf6'; // Purple
                } else {
                  timeframeLabel = `${timeframeData.timeframe_days}D`;
                }
                
                // Create channel rectangle (filled area between upper and lower lines)
                activeChart.createMultipointShape(
                  [
                    {
                      time: new Date(upper.start_date).getTime() / 1000,
                      price: parseFloat(upper.start_price),
                    },
                    {
                      time: new Date(upper.end_date).getTime() / 1000,
                      price: parseFloat(upper.end_price),
                    },
                    {
                      time: new Date(lower.end_date).getTime() / 1000,
                      price: parseFloat(lower.end_price),
                    },
                    {
                      time: new Date(lower.start_date).getTime() / 1000,
                      price: parseFloat(lower.start_price),
                    },
                  ],
                  {
                    shape: "rectangle",
                    disableSelection: true,
                    disableSave: true,
                    //lock: true,
                    disableMove: true,
                    overrides: {
                      backgroundColor: theme === "dark" 
                        ? `${channelColor}20` // 20% opacity
                        : `${channelColor}10`, // 10% opacity
                      borderColor: channelColor,
                      borderWidth: 1,
                      showLabel: true,
                      text: `${timeframeLabel} Channel`,
                      textcolor: channelColor,
                      fontsize: 12,
                      bold: true,
                      lineStyle: 0,
                      lineWidth: 1,
                    },
                  }
                );
                
                // Draw upper line
                activeChart.createMultipointShape(
                  [
                    {
                      time: new Date(upper.start_date).getTime() / 1000,
                      price: parseFloat(upper.start_price),
                    },
                    {
                      time: new Date(upper.end_date).getTime() / 1000,
                      price: parseFloat(upper.end_price),
                    },
                  ],
                  {
                    shape: "trend_line",
                    disableSelection: true,
                    disableSave: true,
                    //lock: true,
                    disableMove: true,
                    overrides: {
                      linecolor: channelColor,
                      linewidth: 2,
                      showLabel: false,
                      lineStyle: 0,
                      showPrice: false,
                    },
                  }
                );
                
                // Draw lower line
                activeChart.createMultipointShape(
                  [
                    {
                      time: new Date(lower.start_date).getTime() / 1000,
                      price: parseFloat(lower.start_price),
                    },
                    {
                      time: new Date(lower.end_date).getTime() / 1000,
                      price: parseFloat(lower.end_price),
                    },
                  ],
                  {
                    shape: "trend_line",
                    disableSelection: true,
                    disableSave: true,
                    //lock: true,
                    disableMove: true,
                    overrides: {
                      linecolor: channelColor,
                      linewidth: 2,
                      showLabel: false,
                      lineStyle: 0,
                      showPrice: false,
                    },
                  }
                );
              }
            });
          });
        }
        
        // Draw trendlines if enabled (using computed trendlines)
        if (showIndividualTrendlines && computedTrendlines && stockData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const drawTrendline = (trendline: any, color: string, label: string, lineStyle: number = 0) => {
            if (!trendline) return;
            
            const startTime = new Date(stockData[trendline.t0].time).getTime() / 1000;
            const endTime = new Date(stockData[trendline.t1].time).getTime() / 1000;
            
            activeChart.createMultipointShape(
              [
                {
                  time: startTime,
                  price: trendline.y0,
                },
                {
                  time: endTime,
                  price: trendline.y1,
                },
              ],
              {
                shape: "trend_line",
                disableSelection: true,
                disableSave: true,
                //lock: true,
                disableMove: true,
                overrides: {
                  linecolor: color,
                  linewidth: 2,
                  showLabel: false,
                  text: "",
                  textcolor: color,
                  fontsize: 10,
                  bold: true,
                  lineStyle: lineStyle,
                  showPrice: false,
                  priceLineColor: color,
                  priceLineWidth: 1,
                  priceLineStyle: lineStyle,
                },
              }
            );
          };

          // Draw trendlines only (majors removed)
          if (computedTrendlines.minor.resistance) {
            drawTrendline(computedTrendlines.minor.resistance, "#f39c12", "", 1); // Dashed, no label
          }
          if (computedTrendlines.minor.support) {
            drawTrendline(computedTrendlines.minor.support, "#1f6feb", "", 1); // Dashed, no label
          }
        }
      } catch (error) {
        console.error("Error drawing shapes:", error);
      }
    }
  }, [
    showSupportZones,
    showResistanceZones,
    showTrendlines,
    showIndividualTrendlines,
    widget,
    zonesData,
    trendlinesData,
    computedTrendlines,
    stockData,
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
            CHANNELS
          </button>
          <button
            onClick={() => setShowIndividualTrendlines(!showIndividualTrendlines)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors duration-200 ${
              showIndividualTrendlines
                ? "bg-purple-500 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            TRENDLINES
          </button>
        </div>
        {isLoading && (
          <div className="text-[10px] text-gray-500">Loading...</div>
        )}
      </div>
      
      {/* Channel Color Legend */}
      {showTrendlines && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-[8px] text-gray-600 font-medium mb-1">CHANNEL TIMEFRAMES:</div>
          <div className="flex flex-wrap gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[8px] text-gray-500">3M</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[8px] text-gray-500">6M</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[8px] text-gray-500">18M</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[8px] text-gray-500">3Y</span>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default ChartControls;

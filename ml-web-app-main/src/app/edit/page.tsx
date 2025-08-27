"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChartRightSection from "@/components/ChartRightSection";
import ChartControls from "@/components/ChartControls";
import MarketTicker from "@/components/MarketTicker";
import { useTheme } from "@/context/ThemeContext";
import { CustomDatafeed } from "@/utils/CustomDatafeed";
import SignalTabs from "@/components/SignalTabs";
import Disclaimer from "@/components/Disclaimer";
import { marketData } from "@/constants/mockdata";
import { useCombinedSignals } from "@/hooks/useCombinedSignals";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TradingView: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Datafeeds: any;
  }
}

interface TradingViewWidget {
  setSymbol: (symbol: string, interval: string, callback: () => void) => void;
  activeChart: () => {
    applyOverrides: (overrides: Record<string, unknown>) => void;
    onSymbolChanged: () => {
      subscribe: (param: null, callback: (symbol: { name: string }) => void) => void;
    };
    resetData: () => void;
  };
  changeTheme: (theme: string) => void;
}

export default function EditPage() {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const [widget, setWidget] = useState<TradingViewWidget | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState<string>("NEPSE");
  const [isSignalExpanded, setIsSignalExpanded] = useState(false);
  const [isRightSectionCollapsed, setIsRightSectionCollapsed] = useState(true);
  const { data: combinedSignalsData, isLoading } = useCombinedSignals(currentSymbol);

  console.log(combinedSignalsData);

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const buttonBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-[#EFF2F5]";
  const buttonTextColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-500";
  const buttonHoverTextColor = theme === "dark" ? "hover:text-white" : "hover:text-gray-900";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "charting_library/charting_library.standalone.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const datafeedScript = document.createElement("script");
      datafeedScript.src = "datafeeds/udf/dist/bundle.js";
      datafeedScript.async = true;
      document.body.appendChild(datafeedScript);

      datafeedScript.onload = () => {
        if (!container.current) return;

        const tvWidget = new window.TradingView.widget({
          fullscreen: false,
          symbol: currentSymbol,
          interval: "1D",
          container: container.current,
          datafeed: new CustomDatafeed(currentSymbol),
          library_path: "charting_library/",
          locale: "en",
          disabled_features: [
            "use_localstorage_for_settings",
            "left_toolbar",
            "context_menus",
            "control_bar",
            "edit_buttons_in_legend",
            "border_around_the_chart",
            "main_series_scale_menu",
            "symbol_info",
            "timeframes_toolbar",
            "volume_force_overlay",
            "create_volume_indicator_by_default",
            "display_market_status",
            "remove_library_container_border",
            "chart_property_page_background",
            "chart_property_page_scales",
            "chart_property_page_style",
            "chart_property_page_timezone_sessions",
            "compare_symbol",
            "header_compare",
            "header_symbol_search_multi",
            "header_chart_type",
            "header_indicators",
            "header_undo_redo",
            "header_quick_search",
            "drawing_templates",
            "format_button_in_legend",
            "go_to_date",
            "hide_left_toolbar_by_default",
            "hide_right_toolbar_by_default",
            "legend_context_menu",
            "show_control_bar",
            "show_interval_dialog_on_key_press",
            "show_logo_on_all_charts",
            "timezone_menu",
            "trading_notifications",
            "use_localstorage_for_settings",
            "volume_force_overlay",
          ],
          enabled_features: ["header_settings", "show_chart_property_page"],
          theme: theme === "dark" ? "Dark" : "Light",
          autosize: true,
          height: "100%",
          width: "100%",
          toolbar_bg: theme === "dark" ? "#1e222d" : "#f8fafd",
          header_widget_background_color: theme === "dark" ? "#131722" : "#ffffff",
          overrides: {
            "paneProperties.backgroundType": "solid",
            "paneProperties.background": theme === "dark" ? "#131722" : "#ffffff",
            "paneProperties.gridProperties.color": theme === "dark" ? "#2a2e39" : "#e0e3eb",
            "paneProperties.gridProperties.vertLinesVisible": false,
            "paneProperties.gridProperties.horzLinesVisible": false,
            "scalesProperties.lineColor": theme === "dark" ? "#2a2e39" : "#e0e3eb",
            "scalesProperties.textColor": theme === "dark" ? "#d1d4dc" : "#131722",
            "mainSeriesProperties.style": 1,
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            "chartProperties.background": theme === "dark" ? "#131722" : "#ffffff",
            "chartProperties.crossHairProperties.color": theme === "dark" ? "#9598A1" : "#131722",
            "chartProperties.crossHairProperties.width": 1,
            "chartProperties.crossHairProperties.style": 2,
            "chartProperties.crossHairProperties.dashStyle": [2, 2],
            "chartProperties.vertGridProperties.color": theme === "dark" ? "#2a2e39" : "#e0e3eb",
            "chartProperties.horzGridProperties.color": theme === "dark" ? "#2a2e39" : "#e0e3eb",
            "chartProperties.crossHairProperties.vertLine.color":
              theme === "dark" ? "#9598A1" : "#131722",
            "chartProperties.crossHairProperties.horzLine.color":
              theme === "dark" ? "#9598A1" : "#131722",
          },
          loading_screen: {
            backgroundColor: theme === "dark" ? "#131722" : "#ffffff",
            foregroundColor: "#2962FF",
          },
        });

        tvWidget.onChartReady(() => {
          const chart = tvWidget.activeChart();
          chart.onSymbolChanged().subscribe(null, (symbol: { name: string }) => {
            setCurrentSymbol(symbol.name);
          });
          setWidget(tvWidget);
        });
      };
    };

    return () => {
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        if (script.src.includes("charting_library") || script.src.includes("datafeeds")) {
          document.body.removeChild(script);
        }
      });
    };
  }, [theme, currentSymbol]);

  const handleSymbolChange = (newSymbol: string) => {
    setCurrentSymbol(newSymbol);
    if (widget) {
      widget.setSymbol(newSymbol, "1D", () => {
        const chart = widget.activeChart();
        if (chart) {
          chart.resetData();
        }
      });
    }
  };

  const handleRightSectionCollapse = (collapsed: boolean) => {
    setIsRightSectionCollapsed(collapsed);
  };

  return (
    <div className={`${bgColor} overflow-hidden h-screen`}>
      <div className="absolute top-4 right-5 z-10">
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 ${buttonBgColor} rounded-lg px-2 py-2 text-xs ${buttonTextColor} ${buttonHoverTextColor} transition-colors duration-300`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex h-full">
        <div
          className={`transition-all duration-300 ${
            isRightSectionCollapsed ? "w-[96%]" : "w-[83%]"
          }`}
        >
          <div
            className={`flex ${
              isSignalExpanded ? "h-[20vh]" : "h-[70vh]"
            } transition-all duration-300`}
          >
            <div className="w-full h-full relative">
              <div ref={container} className="w-full h-full" />
              <div className="absolute top-0 left-[70%] z-10">
                <ChartControls widget={widget} currentSymbol={currentSymbol} />
              </div>
            </div>
          </div>
          <div className="ml-2 my-4">
            <div className="w-full flex flex-col gap-4">
              <MarketTicker data={marketData} />
              <div className="mt-4">
                <SignalTabs
                  data={combinedSignalsData?.data || []}
                  isLoading={isLoading}
                  onExpand={setIsSignalExpanded}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${
            isRightSectionCollapsed ? "w-[4%]" : "w-[17%]"
          }`}
        >
          <ChartRightSection
            onSymbolChange={handleSymbolChange}
            currentSymbol={currentSymbol}
            onCollapseChange={handleRightSectionCollapse}
          />
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

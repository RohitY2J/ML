"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { CustomDatafeed } from "@/utils/CustomDatafeed";

declare global {
  interface Window {
    TradingView: any;
    Datafeeds: any;
  }
}

// NEPSE symbols 
const nepseSymbols = [
    "NHPC",
    "BPCL",
    "CHCL",
    "AHPC",
    "SHPC",
    "RIDI",
    "BARUN",
    "API",
    "NGPL",
    "KKHC",
    "DHPL",
    "AKPL",
    "SPDL",
    "UMHL",
    "CHL",
    "HPPL",
    "NHDL",
    "RADHI",
    "PMHPL",
    "KPCL",
    "AKJCL",
    "JOSHI",
    "UPPER",
    "GHL",
    "UPCL",
    "MHNL",
    "PPCL",
    "HURJA",
    "UNHPL",
    "RHPL",
    "SJCL",
    "HDHPC",
    "LEC",
    "SSHL",
    "MEN",
    "UMRH",
    "GLH",
    "SHEL",
    "RURU",
    "MKJC",
    "SAHAS",
    "TPC",
    "SPC",
    "NYADI",
    "MBJC",
    "BNHC",
    "GVL",
    "BHL",
    "RFPL",
    "DORDI",
    "BHDC",
    "HHL",
    "UHEWA",
    "SGHC",
    "MHL",
    "USHEC",
    "RHGCL",
    "SPHL",
    "PPL",
    "SIKLES",
    "EHPL",
    "PHCL",
    "BHPL",
    "SMHL",
    "SPL",
    "SMH",
    "MKHC",
    "AHL",
    "TAMOR",
    "MHCL",
    "SMJC",
    "MAKAR",
    "MKHL",
    "DOLTI",
    "BEDC",
    "MCHL",
    "IHL",
    "MEL",
    "RAWA",
    "USHL",
    "TSHL",
    "KBSH",
    "MEHL",
    "ULHC",
    "MANDU",
    "BGWT",
    "MSHL",
    "MMKJL",
    "TVCL",
    "VLUCL",
    "CKHL",
    "SANVI",
    "SHL", "TRH", "OHL", "CGH", "KDL", "CITY",
    "NABIL",
    "NIMB",
    "SCB",
    "HBL",
    "SBI",
    "EBL",
    "NICA",
    "MBL",
    "LSL",
    "KBL",
    "SBL",
    "SANIMA",
    "NMB",
    "PRVU",
    "GBIME",
    "CZBIL",
    "PCBL",
    "ADBL",
    "NBL",
    "NABBC",
    "EDBL",
    "LBBL",
    "MDB",
    "MLBL",
    "GBBL",
    "JBBL",
    "CORBL",
    "KSBBL",
    "SADBL",
    "SHINE",
    "MNBBL",
    "SINDU",
    "GRDBL",
    "SAPDBL",
  ];

const Chart: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const [widget, setWidget] = useState<any>(null);
  const [currentSymbol, setCurrentSymbol] = useState<string>("ADBL");
  const [interval, setInterval] = useState<string>("1D");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>(nepseSymbols);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const { theme } = useTheme();

  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const buttonBgColor = theme === "dark" ? "bg-dark-light" : "bg-[#EFF2F5]";
  const buttonTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const buttonHoverTextColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const buttonActiveBgColor = theme === "dark" ? "bg-dark-default" : "bg-white";

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
          interval: interval,
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
            "symbol_search_hot_key",
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
            "drawing_templates",
            "format_button_in_legend",
            "go_to_date",
            "hide_left_toolbar_by_default",
            "hide_right_toolbar_by_default",
            "legend_context_menu",
            "show_chart_property_page",
            "show_control_bar",
            "show_interval_dialog_on_key_press",
            "show_logo_on_all_charts",
            "header_compare",
            "header_indicators",
            "header_undo_redo",
            "header_quick_search",
            "header_fullscreen_button",
            "header_screenshot",
            "header_chart_type",
            "header_resolutions",
            "timezone_menu",
            "trading_notifications",
            "use_localstorage_for_settings",
            "volume_force_overlay",
          ],
          enabled_features: ["header_widget", "symbol_search"],
          theme: theme === "dark" ? "Dark" : "Light",
          autosize: true,
          height: "100%",
          width: "100%",
          toolbar_bg: theme === "dark" ? "#1e222d" : "#f8fafd",
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
            setSearchQuery(symbol.name);
            setIsDropdownOpen(false);
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
  }, [interval, theme, currentSymbol]);

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
    if (widget) {
      widget.chart().setResolution(newInterval);
    }
  };

  const handleSymbolChange = (newSymbol: string) => {
    if (nepseSymbols.includes(newSymbol.toUpperCase())) {
      setCurrentSymbol(newSymbol.toUpperCase());
      setSearchQuery(newSymbol.toUpperCase());
      setIsDropdownOpen(false);
      if (widget) {
        widget.setSymbol(newSymbol.toUpperCase(), interval, () => {
          const chart = widget.activeChart();
          if (chart) {
            chart.resetData();
          }
        });
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toUpperCase();
    setSearchQuery(query);
    setFilteredSymbols(
      nepseSymbols.filter((symbol) =>
        symbol.toUpperCase().includes(query)
      )
    );
    setIsDropdownOpen(true);
  };

  const handleSymbolSelect = (symbol: string) => {
    handleSymbolChange(symbol);
    setIsDropdownOpen(false);
  };

  const handleEditClick = () => {
    router.push("/edit");
  };

  return (
    <div className={`px-6 pt-6`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${textColor}`}>{currentSymbol} Chart</h2>
        <div className="flex items-center gap-4">
          {/* Symbol Search */}
          <div className={`relative ${buttonBgColor} rounded-lg`}>
            <input
              type="text"
              placeholder="Search NEPSE symbol..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`px-3 py-2 text-xs bg-transparent ${buttonTextColor} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg w-40`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSymbolChange(searchQuery);
                  setIsDropdownOpen(false);
                }
              }}
            />
            {isDropdownOpen && searchQuery && filteredSymbols.length > 0 && (
              <ul className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto ${theme === "dark" ? "bg-[#1e222d]" : "bg-white"} border border-gray-300 rounded-lg shadow-lg`}>
                {filteredSymbols.map((symbol) => (
                  <li
                    key={symbol}
                    onClick={() => handleSymbolSelect(symbol)}
                    className={`px-3 py-2 text-xs cursor-pointer ${theme === "dark" ? "text-[#D1D4DC] hover:bg-[#2a2e39]" : "text-gray-900 hover:bg-gray-100"}`}
                  >
                    {symbol}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`relative flex ${buttonBgColor} rounded-lg p-1 px-3 gap-5`}>
            <button
              onClick={() => handleIntervalChange("1D")}
              className={`relative flex-1 py-2 text-xs transition-colors duration-300 rounded-md z-10 ${
                interval === "1D" ? `${textColor}` : `${buttonTextColor} font-medium`
              }`}
            >
              1D
            </button>
            <button
              onClick={() => handleIntervalChange("1W")}
              className={`relative flex-1 py-2 text-xs transition-colors duration-300 rounded-md z-10 ${
                interval === "1W" ? `${textColor}` : `${buttonTextColor} font-medium`
              }`}
            >
              1W
            </button>
            <button
              onClick={() => handleIntervalChange("1M")}
              className={`relative flex-1 py-2 text-xs transition-colors duration-300 rounded-md z-10 ${
                interval === "1M" ? `${textColor}` : `${buttonTextColor} font-medium`
              }`}
            >
              1M
            </button>
            <button
              onClick={() => handleIntervalChange("1Y")}
              className={`relative flex-1 py-2 text-xs transition-colors duration-300 rounded-md z-10 ${
                interval === "1Y" ? `${textColor}` : `${buttonTextColor} font-medium`
              }`}
            >
              1Y
            </button>
            <div
              className={`absolute h-[calc(100%-8px)] w-[calc(25%-4px)] ${buttonActiveBgColor} rounded-md transition-all duration-300 ease-in-out ${
                interval === "1D"
                  ? "left-1"
                  : interval === "1W"
                  ? "left-[calc(25%+3px)]"
                  : interval === "1M"
                  ? "left-[calc(50%+5px)]"
                  : "left-[calc(75%)]"
              }`}
            />
          </div>
          <button
            onClick={handleEditClick}
            className={`relative flex items-center gap-2 ${buttonBgColor} rounded-lg px-3 py-2 text-xs ${buttonTextColor} hover:${buttonHoverTextColor} transition-colors duration-300`}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            MeroLagani Ai
          </button>
        </div>
      </div>

      <div
        className={`h-[500px] rounded-lg overflow-hidden ${
          theme === "dark" ? "bg-[#cdcdcd]" : "bg-white"
        }`}
      >
        <div ref={container} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Chart;
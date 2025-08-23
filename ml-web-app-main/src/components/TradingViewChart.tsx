"use client"

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TradingView: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Datafeeds: any;
  }
}

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: "Light" | "Dark";
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "AAPL",
  interval = "1D",
  theme = "Light"
}) => {
  const container = useRef<HTMLDivElement>(null);

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
          symbol: symbol,
          interval: interval,
          container: container.current,
          datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
            "https://demo-feed-data.tradingview.com",
            undefined,
            {
              maxResponseLength: 1000,
              expectedOrder: "latestFirst",
            }
          ),
          library_path: "charting_library/",
          locale: "en",
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
          theme: theme,
          autosize: true,
          height: "80%",
          width: "100%",
        });

        tvWidget.onChartReady(() => {
          tvWidget.activeChart();
        });
      };
    };

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll("script");
      scripts.forEach((script) => {
        if (
          script.src.includes("charting_library") ||
          script.src.includes("datafeeds")
        ) {
          document.body.removeChild(script);
        }
      });
    };
  }, [symbol, interval, theme]);

  return (
    <div className="w-full h-[600px] bg-white">
      <div ref={container} className="w-full h-full" />
    </div>
  );
};

export default TradingViewChart; 
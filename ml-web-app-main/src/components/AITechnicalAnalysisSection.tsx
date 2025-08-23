import React, { useState } from "react";
import { useTechnicalAnalysis } from "@/hooks/useTechnicalAnalysis";

interface AITechnicalAnalysisSectionProps {
  isEditPage: boolean;
  currentSymbol: string;
  theme: string;
  textColor: string;
  secondaryTextColor: string;
  positiveColor: string;
  negativeColor: string;
}

const AITechnicalAnalysisSection: React.FC<AITechnicalAnalysisSectionProps> = ({
  isEditPage,
  currentSymbol,
  theme,
  textColor,
  secondaryTextColor,
  positiveColor,
  negativeColor,
}) => {
  const [expanded, setExpanded] = useState(!isEditPage); // collapsed by default if isEditPage

  const {
    data: technicalAnalysis,
    isLoading,
    error,
  } = useTechnicalAnalysis(currentSymbol);

  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  // Loading and error states only show when expanded
  if (isLoading && expanded) {
    return (
      <div className={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if ((error || !technicalAnalysis?.data) && expanded) {
    return (
      <div className={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
        <div className={`${textColor} text-sm`}>
          Failed to load technical analysis
        </div>
      </div>
    );
  }

  const data = technicalAnalysis?.data;

  return (
    <div className={`${bgColor} p-4 rounded-lg border ${borderColor}`}>
      {/* Title with toggle behavior */}
      <div
        className={`flex items-center justify-between ${
          expanded ? "mb-4" : "mb-0"
        } cursor-pointer `}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div>
          <h3 className={`text-sm font-semibold ${textColor}`}>
            AI Technical Analysis
          </h3>
          <p className={`text-11 ${secondaryTextColor}`}>
            Real-time market insights
          </p>
        </div>
        <div
          className={`w-8 h-8 rounded-full ${
            theme === "dark" ? "bg-[#2962FF]" : "bg-blue-500"
          } flex items-center justify-center`}
        >
          <svg
            className={`w-5 h-5 text-white transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Conditional content */}
      {expanded && data && (
        <div className="space-y-4">
          {/* Support/Resistance Zones */}
          <div>
            <div className={`${secondaryTextColor} text-11 font-medium mb-2`}>
              Support/Resistance Zones
            </div>
            <div className="space-y-2">
              {Object.entries(data["Support/Resistance Zones"]).map(
                ([key, value]) => {
                  const center = Number(value);
                  const zoneRange = 10;
                  const lower = (center - zoneRange).toFixed(2);
                  const upper = (center + zoneRange).toFixed(2);
                  const label = `${lower} - ${upper}`;

                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className={`${textColor} text-11`}>
                        {key} ({key[0]}
                        {key.at(-1)})
                      </span>
                      <span
                        className={`${
                          key.includes("Support")
                            ? positiveColor
                            : negativeColor
                        } text-11 font-medium`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Trend Analysis */}
          <div>
            <div className={`${secondaryTextColor} text-11 font-medium mb-2`}>
              Trend Analysis
            </div>
            <div className="space-y-2">
              {Object.entries(data["Trend Analysis"]).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className={`${textColor} text-11`}>{key}</span>
                  <span className={`${positiveColor} text-11 font-medium`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div>
            <div className={`${secondaryTextColor} text-11 font-medium mb-2`}>
              Key Indicators
            </div>
            <div className="space-y-2">
              {Object.entries(data["Key Indicators"]).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className={`${textColor} text-11`}>{key}</span>
                  <span className={`${positiveColor} text-11 font-medium`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Analysis */}
          <div>
            <div className={`${secondaryTextColor} text-11 font-medium mb-2`}>
              Volume Analysis
            </div>
            <div className="space-y-2">
              {Object.entries(data["Volume Analysis"]).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className={`${textColor} text-11`}>{key}</span>
                  <span className={`${positiveColor} text-11 font-medium`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITechnicalAnalysisSection;

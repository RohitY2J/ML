import { useTheme } from "@/context/ThemeContext";
import { Stats } from "./PriceStats";

export interface MarketStatsProp {
  marketStats?: Stats
}
  
  
const MarketBreadth: React.FC<MarketStatsProp> = ({marketStats= {}}) => {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";

  const stats = [
    { label: "Advanced", value: marketStats.advanced, color: "text-green-500", bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-200/50' },
    { label: "Declined", value: marketStats.declined, color: "text-red-500", bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-200/50' },
    { label: "Unchanged", value: marketStats.unchanged, color: "text-yellow-500", bgColor: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-200/50' },
  ];

  return (
    <div className={`w-full px-3 sm:px-5 rounded-lg h-full`}>
      {/* Responsive grid: single column on mobile, 3 columns on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`${stat.bgColor} rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center min-h-[60px] sm:min-h-[80px]`}
          >
            <div className={`text-lg sm:text-[20px] font-medium ${stat.color}`}>
              {stat.value}
            </div>
            <div className={`text-xs sm:text-[13px] ${textColor} mt-1 text-center`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 

export default MarketBreadth;
import { useTheme } from "@/context/ThemeContext";

export default function MarketBreadth() {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";

  const stats = [
    { label: "Advanced", value: 82, color: "text-green-500", bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-200/50' },
    { label: "Declined", value: 164, color: "text-red-500", bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-200/50' },
    { label: "Unchanged", value: 1, color: "text-yellow-500", bgColor: theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-200/50' },
  ];

  return (
    <div className={`w-full px-5 rounded-lg h-full`}>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`${stat.bgColor} rounded-lg p-4 flex flex-col items-center justify-center`}
          >
            <div className={`text-[20px] font-medium ${stat.color}`}>
              {stat.value}
            </div>
            <div className={`text-[13px] ${textColor} mt-1`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
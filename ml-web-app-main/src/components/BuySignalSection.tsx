import React from "react";

interface BuySignal {
  date: string;
  pricePoint: string;
}

interface BuySignalSectionProps {
  buySignals: BuySignal[];
  theme: string;
  textColor: string;
  secondaryTextColor: string;
  positiveColor: string;
}

const BuySignalSection: React.FC<BuySignalSectionProps> = ({
  buySignals,
  theme,
  textColor,
  secondaryTextColor,
  positiveColor,
}) => {
  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <h3 className={`text-sm font-semibold mb-2 ${textColor}`}>Buy Signal</h3>
      <div className="space-y-3">
        {buySignals.map((signal, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <div className={`${secondaryTextColor} text-11 font-normal`}>
                Signal Date
              </div>
              <div className={`${textColor} text-sm font-semibold`}>
                {signal.date}
              </div>
            </div>
            <div className="text-right">
              <div className={`${secondaryTextColor} text-11 font-normal`}>
                Buy Price Point
              </div>
              <div className={`${positiveColor} text-sm font-semibold`}>
                {signal.pricePoint}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuySignalSection;

import React from "react";

interface TradingZones {
  symbol: string;
  timeframe_days: number;
  immediate_demand_zone: {
    bottom_price: string;
    center_price: string;
    top_price: string;
  };
  immediate_supply_zone: {
    bottom_price: string;
    center_price: string;
    top_price: string;
  };
  stop_loss_zone: {
    bottom_price: string;
    center_price: string;
    top_price: string;
  };
}

interface CurrentStrategySectionProps {
  tradingZones: TradingZones | undefined;
  theme: string;
  textColor: string;
  secondaryTextColor: string;
  positiveColor: string;
  formatPrice: (price: string | undefined) => string;
}

const CurrentStrategySection: React.FC<CurrentStrategySectionProps> = ({
  tradingZones,
  theme,
  textColor,
  secondaryTextColor,
  positiveColor,
  formatPrice,
}) => {
  if (!tradingZones) {
    return null;
  }

  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <h3 className={`text-sm font-semibold mb-2 ${textColor}`}>
        Current Strategy
      </h3>
      <div className="space-y-3">
        <div>
          <div className={`${secondaryTextColor} text-11 font-normal mb-1`}>
            TRAILING STOP LOSS (SELL)
          </div>
          <div className={`${secondaryTextColor} text-11 font-normal mb-1`}>
            CURRENT MARKET STAGE
          </div>
          <div className={`${positiveColor} text-11 font-medium`}>
            {tradingZones ? "Active" : "Loading..."}
          </div>
        </div>
        <div>
          <div className={`${secondaryTextColor} text-11 font-normal mb-1`}>
            Immediate Demand Zone
          </div>
          <div className={`${textColor} text-sm font-semibold`}>
            {tradingZones?.immediate_demand_zone
              ? `${formatPrice(
                  tradingZones.immediate_demand_zone.bottom_price
                )}-${formatPrice(tradingZones.immediate_demand_zone.top_price)}`
              : "N/A"}
          </div>
        </div>
        <div>
          <div className={`${secondaryTextColor} text-11 font-normal mb-1`}>
            Immediate Supply Zone
          </div>
          <div className={`${textColor} text-sm font-semibold`}>
            {tradingZones?.immediate_supply_zone
              ? `${formatPrice(
                  tradingZones.immediate_supply_zone.bottom_price
                )}-${formatPrice(tradingZones.immediate_supply_zone.top_price)}`
              : "Loading..."}
          </div>
        </div>
        <div>
          <div className={`${secondaryTextColor} text-11 font-normal mb-1`}>
            Sell Only If Closing Below
          </div>
          <div className={`${textColor} text-sm font-semibold`}>
            {formatPrice(tradingZones?.stop_loss_zone?.bottom_price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStrategySection;

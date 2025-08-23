import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface TradingZone {
  bottom_price: string;
  center_price: string;
  top_price: string;
}

interface TradingZones {
  symbol: string;
  timeframe_days: number;
  immediate_demand_zone: TradingZone;
  immediate_supply_zone: TradingZone;
  stop_loss_zone: TradingZone;
}

interface TradingZonesResponse {
  success: boolean;
  data: TradingZones;
  message: string;
}

export const useTradingZones = (symbol: string, timeframe: number = 90) => {
  return useQuery<TradingZonesResponse>({
    queryKey: ["tradingZones", symbol, timeframe],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/trading-zones/${symbol}`, {
        params: { timeframe }
      });
      return response.data;
    },
    enabled: !!symbol,
  });
};

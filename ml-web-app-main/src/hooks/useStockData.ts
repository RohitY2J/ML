import { useQuery } from '@tanstack/react-query';
import { getDailyStockData, getIntradayStockData, StockDataResponse } from '@/services/api/stockData';

export const useDailyStockData = (symbol: string, startDate: string, endDate: string) => {
  return useQuery<StockDataResponse>({
    queryKey: ['dailyStockData', symbol, startDate, endDate],
    queryFn: () => getDailyStockData(symbol, startDate, endDate),
    enabled: !!symbol && !!startDate && !!endDate,
  });
};

export const useIntradayStockData = (symbol: string, startDate: string, endDate: string) => {
  return useQuery<StockDataResponse>({
    queryKey: ['intradayStockData', symbol, startDate, endDate],
    queryFn: () => getIntradayStockData(symbol, startDate, endDate),
    enabled: !!symbol && !!startDate && !!endDate,
  });
}; 
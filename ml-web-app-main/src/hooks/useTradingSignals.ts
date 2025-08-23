import { useQuery } from '@tanstack/react-query';
import { getTradingSignals, TradingSignalsResponse } from '@/services/api/tradingSignals';

export const useTradingSignals = () => {
  return useQuery<TradingSignalsResponse>({
    queryKey: ['tradingSignals'],
    queryFn: getTradingSignals,
  });
}; 
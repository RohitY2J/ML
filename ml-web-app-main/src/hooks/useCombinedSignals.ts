import { useQuery } from '@tanstack/react-query';
import { getCombinedSignals, CombinedSignalsResponse, getCombinedSignalsBySymbol } from '@/services/api/combinedSignals';

export const useCombinedSignals = (symbol: string) => {
  return useQuery({
    queryKey: ['combinedSignals', symbol],
    queryFn: () => getCombinedSignals(symbol),
    enabled: !!symbol,
  });
};

export const useCombinedSignalsBySymbol = (symbol: string) => {
  return useQuery<CombinedSignalsResponse>({
    queryKey: ['combinedSignals', symbol],
    queryFn: () => getCombinedSignalsBySymbol(symbol),
    enabled: !!symbol,
  });
}; 
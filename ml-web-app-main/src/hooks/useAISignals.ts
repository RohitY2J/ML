import { useQuery } from '@tanstack/react-query';
import { getAISignals, AISignalsResponse, getAISignalsBySymbol } from '@/services/api/aiSignals';

export const useAISignals = () => {
  return useQuery<AISignalsResponse>({
    queryKey: ['aiSignals'],
    queryFn: getAISignals,
  });
};

export const useAISignalsBySymbol = (symbol: string) => {
  return useQuery<AISignalsResponse>({
    queryKey: ['aiSignals', symbol],
    queryFn: () => getAISignalsBySymbol(symbol),
    enabled: !!symbol,
  });
}; 
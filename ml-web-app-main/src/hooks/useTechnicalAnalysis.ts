import { useQuery } from '@tanstack/react-query';
import { getTechnicalAnalysis } from '@/services/api/technicalAnalysis';

export const useTechnicalAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ['technicalAnalysis', symbol],
    queryFn: () => getTechnicalAnalysis(symbol),
    enabled: !!symbol,
  });
}; 
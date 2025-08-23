import axiosInstance from '@/lib/axios';

export interface TradingSignal {
  id: number;
  symbol: string;
  ltp: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  buy_target: string | null;
  sell_target: string | null;
  stop_loss: string | null;
  change_percent: string;
  created_at: string;
}

export interface TradingSignalsResponse {
  success: boolean;
  data: TradingSignal[];
  message: string;
}

export const getTradingSignals = async (): Promise<TradingSignalsResponse> => {
  const response = await axiosInstance.get('/api/signals/trading-signals');
  return response.data;
};
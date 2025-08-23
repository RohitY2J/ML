import axiosInstance from '@/lib/axios';

export interface AISignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  buy_date: string;
  buy_price: number;
  adj_buy_price: number | null;
  sold_date: string | null;
  sold_price: number | null;
  current_strategy: string;
  point_change: number | null;
  profit_loss_pct: number | null;
  buy_range: string;
  sell_range: string;
  risk_reward_ratio: string;
  stop_loss: string;
  trade_result: string | null;
}

export interface AISignalsResponse {
  success: boolean;
  data: AISignal[];
  message: string;
}

export const getAISignals = async (): Promise<AISignalsResponse> => {
  const response = await axiosInstance.get('/api/ai-signals');
  return response.data;
};

export const getAISignalsBySymbol = async (symbol: string): Promise<AISignalsResponse> => {
  const response = await axiosInstance.get(`/api/ai-signals/${symbol}`);
  return response.data;
}; 
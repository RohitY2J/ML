import axiosInstance from '@/lib/axios';
import { TradingSignal } from './tradingSignals';
import { AISignal } from './aiSignals';

export interface TechnicalIndicators {
  SMA20: number;
  SMA50: number;
  EMA20: number;
  MACD: number;
  MACD_Signal: number;
  RSI: number;
  Stochastic_K: number;
  Stochastic_D: number;
  BB_High: number;
  BB_Low: number;
  BB_Mid: number;
  VWAP: number;
}

export interface CombinedSignal {
  date: string;
  Stock: string;
  Signal: string;
  "Buy Date": string;
  "Buy Price": number;
  "Adj. Buy Price": string;
  Sold: string;
  "Sold Price": number;
  "Current Strategy": string;
  "Point Change": string;
  "Profit/Loss%": string;
  "Buy Range": string;
  "Sell Range": string;
  "Risk-To-Reward Ratio": string;
  "Stop Loss": number;
  "Trade Result": string;
  "Technical Indicators": TechnicalIndicators;
}

export interface CombinedSignals {
  ai_signals: AISignal[];
  traditional_signals: TradingSignal[];
}

export interface CombinedSignalsResponse {
  success: boolean;
  data: CombinedSignal[];
  message: string;
}

export const getCombinedSignals = async (symbol: string): Promise<CombinedSignalsResponse> => {
  const response = await axiosInstance.get(`/api/signals/combined-signals?symbol=${symbol}`);
  return response.data;
};

export const getCombinedSignalsBySymbol = async (symbol: string): Promise<CombinedSignalsResponse> => {
  const response = await axiosInstance.get(`/api/combined-signals/${symbol}`);
  return response.data;
}; 
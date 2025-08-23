import axiosInstance from '@/lib/axios';

export interface StockData {
  date: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDataResponse {
  success: boolean;
  data: StockData[];
  message: string;
}

export const getDailyStockData = async (symbol: string, startDate: string, endDate: string): Promise<StockDataResponse> => {
  const response = await axiosInstance.get(`/api/stocks/daily/${symbol}`, {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};

export const getIntradayStockData = async (symbol: string, startDate: string, endDate: string): Promise<StockDataResponse> => {
  const response = await axiosInstance.get(`/api/stocks/intraday/${symbol}`, {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
}; 
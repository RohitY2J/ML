import axiosInstance from '@/lib/axios';

export interface SupportResistanceZones {
  "Support Level 1": number;
  "Support Level 2": number;
  "Support Level 3": number;
  "Resistance Level 1": number;
  "Resistance Level 2": number;
  "Resistance Level 3": number;
}

export interface TrendAnalysis {
  "Current Trend": string;
  "Strength": string;
}

export interface KeyIndicators {
  "RSI (14)": number;
  "MACD": string;
}

export interface VolumeAnalysis {
  "Volume Trend": string;
  "Volume vs Avg": string;
}

export interface TechnicalAnalysis {
  symbol: string;
  "Support/Resistance Zones": SupportResistanceZones;
  "Trend Analysis": TrendAnalysis;
  "Key Indicators": KeyIndicators;
  "Volume Analysis": VolumeAnalysis;
}

export interface TechnicalAnalysisResponse {
  success: boolean;
  data: TechnicalAnalysis;
  message: string;
}

export const getTechnicalAnalysis = async (symbol: string): Promise<TechnicalAnalysisResponse> => {
  const response = await axiosInstance.get(`/api/technical-analysis?symbol=${symbol}`);
  return response.data;
}; 
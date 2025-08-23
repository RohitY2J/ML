import { PriceStats, StockData, StockModel } from '../models/StockModel';
import logger from '../utils/logger';

export async function getDailyData(symbol: string, startDate?: string, endDate?: string): Promise<StockData[]> {
  try {
    logger.info('StockService: Fetching daily data', { symbol, startDate, endDate });
    const data = await StockModel.getDailyData(symbol, startDate, endDate);
    logger.info('StockService: Retrieved daily data', { symbol, count: data.length });
    return data;
  } catch (error) {
    logger.error('Error in getDailyDataService:', { symbol, error });
    throw error;
  }
}

export async function getLatestPriceStats(symbol: string): Promise<PriceStats>{
  try{
    logger.info('StockService: Fetching price stats data', { symbol });
    const data = await StockModel.getLatestPriceStats(symbol);
    logger.info('StockService: Retrieved price stats data', { symbol });
    return data;
  }
  catch(error){
    logger.error('Error in getting latest price status:', { symbol, error });
    throw error;
  }
}

export async function getIntradayData(symbol: string, startDate?: string, endDate?: string): Promise<StockData[]> {
  try {
    logger.info('StockService: Fetching intraday data', { symbol, startDate, endDate });
    const data = await StockModel.getIntradayData(symbol, startDate, endDate);
    logger.info('StockService: Retrieved intraday data', { symbol, count: data.length });
    return data;
  } catch (error) {
    logger.error('Error in getIntradayDataService:', { symbol, error });
    throw error;
  }
} 
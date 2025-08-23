import { TrendlineData, TrendlineModel } from '../models/TrendlineModel';
import logger from '../utils/logger';

export async function getTrendlines(symbol: string, timeframe_days: number): Promise<TrendlineData> {
    try {
        logger.info('TrendlineService: Fetching trendlines', { symbol, timeframe_days });
        const trendlines = await TrendlineModel.getTrendlines(symbol, timeframe_days);
        logger.info('TrendlineService: Retrieved trendlines', { 
            symbol, 
            timeframe_days, 
            count: trendlines.trendlines.length 
        });
        return trendlines;
    } catch (error) {
        logger.error('Error in getTrendlinesService:', { symbol, timeframe_days, error });
        throw error;
    }
} 
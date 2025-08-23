import pool from '../config/database';
import logger from '../utils/logger';

export interface Trendline {
    trendline_number: number;
    start_date: Date;
    end_date: Date;
    start_price: number;
    end_price: number;
    slope: number;
    trend_type: string;
}

export interface TrendlineData {
    symbol: string;
    timeframe_days: number;
    trendlines: Trendline[];
}

export class TrendlineModel {
    static async getTrendlines(symbol: string, timeframe_days: number): Promise<TrendlineData> {
        try {
            const query = `
                SELECT trendline_number, start_date, end_date, 
                       start_price, end_price, slope, trend_type
                FROM trendlines
                WHERE symbol = $1 AND timeframe_days = $2
                ORDER BY trendline_number
            `;
            logger.debug('Fetching trendlines', { symbol, timeframe_days });
            const result = await pool.query(query, [symbol, timeframe_days]);
            logger.debug('Trendlines fetched', { 
                symbol, 
                timeframe_days,
                count: result.rows.length
            });

            return {
                symbol,
                timeframe_days,
                trendlines: result.rows
            };
        } catch (error) {
            logger.error('Trendlines fetch failed', { symbol, timeframe_days, error });
            throw error;
        }
    }
} 
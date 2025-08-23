import pool from '../config/database';
import logger from '../utils/logger';

export interface StockData {
  date: Date;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceStats{
  currentPrice: number;
  percentChange: number;
  volume: number;
  advanced: number;
  declined: number;
  unchanged: number;
}

export class StockModel {
  static async getDailyData(symbol: string, startDate?: string, endDate?: string): Promise<StockData[]> {
    try {
      let query = `
        SELECT date, symbol, open, high, low, close, volume
        FROM daily_data
        WHERE symbol = $1
      `;
      const params: any[] = [symbol];

      if (startDate) {
        query += ' AND date >= $2';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND date <= $' + (params.length + 1);
        params.push(endDate);
      }

      query += ' ORDER BY date ASC';

      logger.debug('Fetching daily data', { symbol });
      const result = await pool.query(query, params);
      logger.debug('Daily data fetched', { symbol, count: result.rows.length });
      return result.rows;
    } catch (error) {
      logger.error('Daily data fetch failed', { symbol, error });
      throw error;
    }
  }

  static async getLatestPriceStats(symbol: string, startDate?: string, endDate?: string): Promise<PriceStats> {
    try {
      let query = `
        SELECT date, symbol, open, high, low, close, volume
        FROM daily_data
        WHERE symbol = 'NEPSE'
        order by date desc
        limit 1;
      `;
      const params: any[] = [symbol];
      const result = await pool.query(query, );
      const nepseData = result.rows[0];


      let tradingSignalQuery = `
        SELECT 
            COUNT(CASE WHEN change_percent > 0 AND symbol != 'NEPSE' THEN 1 END) AS positive_count,
            COUNT(CASE WHEN change_percent < 0 AND symbol != 'NEPSE' THEN 1 END) AS negative_count,
            COUNT(CASE WHEN change_percent = 0 AND symbol != 'NEPSE' THEN 1 END) AS zero_count,
            (SELECT change_percent FROM trading_signals n WHERE n.symbol = 'NEPSE' LIMIT 1) AS nepse_change_percent
        FROM trading_signals
        WHERE symbol != 'NEPSE';
      `;

      const tradingSignalResult = await pool.query(tradingSignalQuery, );
      const tradingSignalData = tradingSignalResult.rows[0];

      logger.debug('Daily data fetched', { symbol, count: result.rows.length });
      return {
        currentPrice: nepseData.close,
        volume: nepseData.volume,
        percentChange: tradingSignalData.nepse_change_percent,
        advanced: tradingSignalData.positive_count,
        declined: tradingSignalData.negative_count,
        unchanged: tradingSignalData.zero_count
      }
    } catch (error) {
      logger.error('Daily data fetch failed', { symbol, error });
      throw error;
    }
  } 

  static async getIntradayData(symbol: string, startDate?: string, endDate?: string): Promise<StockData[]> {
    try {
      let query = `
        SELECT timestamp as date, symbol, open, high, low, close, volume
        FROM intraday_data
        WHERE symbol = $1
      `;
      const params: any[] = [symbol];

      if (startDate) {
        query += ' AND timestamp >= $2';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND timestamp <= $' + (params.length + 1);
        params.push(endDate);
      }

      query += ' ORDER BY timestamp ASC';

      logger.debug('Fetching intraday data', { symbol });
      const result = await pool.query(query, params);
      logger.debug('Intraday data fetched', { symbol, count: result.rows.length });
      return result.rows;
    } catch (error) {
      logger.error('Intraday data fetch failed', { symbol, error });
      throw error;
    }
  }
} 
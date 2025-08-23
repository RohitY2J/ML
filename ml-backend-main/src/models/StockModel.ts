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
import pool from '../config/database';
import logger from '../utils/logger';

export interface AnalyticsSignal {
    date: Date;
    symbol: string;
    close: number;
    signal: number;
    change_percent: number;
    sma_20: number;
    sma_50: number;
    ema_20: number;
    macd: number;
    macd_signal: number;
    rsi_14: number;
    stoch_k: number;
    stoch_d: number;
    bb_high: number;
    bb_low: number;
    bb_mid: number;
    vwap: number;
    created_at: Date;
}

export class AnalyticsSignalModel {
    static async getHistoricalSignals(symbol: string): Promise<AnalyticsSignal[]> {
        try {
            const query = `
                WITH previous_day AS (
                    SELECT 
                        sha.symbol,
                        sha.date,
                        sha.close as prev_close
                    FROM signal_history_analytics sha
                    WHERE sha.symbol = $1
                    AND EXTRACT(YEAR FROM sha.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                )
                SELECT 
                    sha.*,
                    CASE 
                        WHEN pd.prev_close IS NOT NULL 
                        THEN ((sha.close - pd.prev_close) / pd.prev_close * 100)
                        ELSE 0
                    END as change_percent
                FROM signal_history_analytics sha
                LEFT JOIN previous_day pd 
                    ON sha.symbol = pd.symbol 
                    AND sha.date = pd.date + interval '1 day'
                WHERE sha.symbol = $1
                AND EXTRACT(YEAR FROM sha.date) = EXTRACT(YEAR FROM CURRENT_DATE)
                ORDER BY sha.date DESC
            `;
            
            logger.debug('Fetching current year analytics signals', { symbol });
            const result = await pool.query(query, [symbol]);
            logger.debug('Current year analytics signals fetched', { count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error('Current year analytics signals fetch failed', { error, symbol });
            throw error;
        }
    }
} 
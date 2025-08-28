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
    status: string;
    direction: string;
    entry_price: number;
    tp_low: number;
    tp_high: number;
    stop_price: number;
    opened_at: string;
    closed_at: string | null;
    exit_price: number | null;
    exit_reason: string | null;
    confidence?: number;
    quantity?: number;
    extras?: object;
}

export interface WatchListSignal{
    id: number,
    stock: string,
    ltp: number,
    change: number
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

    static async updateToWatchList(symbol: string, toAdd: boolean): Promise<WatchListSignal[]> {
        try {
            const query = `UPDATE symbols
                        SET is_watched = ${toAdd}
                        WHERE symbol = '${symbol}';`;
    
            await pool.query(query, );
            const result = await AnalyticsSignalModel.getWatchListSignal();
            return result;
        } catch (error) {
            logger.error('Current year analytics signals fetch failed', { error });
            throw error;
        }
    }


    static async updateTradingSignal(symbol: string, signal: string): Promise<string> {
        try {
            const query = `UPDATE trading_signals
                        SET signal = '${signal}'
                        WHERE symbol = '${symbol}';`;
    
            const result = await pool.query(query, );
            //await AnalyticsSignalModel.getWatchListSignal();
            return result.rows[0];
        } catch (error) {
            logger.error('Current year analytics signals fetch failed', { error });
            throw error;
        }
    }

    static async getWatchListSignal(): Promise<WatchListSignal[]> {
        try {
            const query = `SELECT 
                            ts.id as id,
                            ts.symbol as stock,
                            ts.ltp as ltp,
                            ts.change_percent as change,
                            ts.signal
                        FROM trading_signals ts
                        INNER JOIN symbols s ON ts.symbol = s.symbol
                        WHERE s.is_watched = true;`;

                        
            const result = await pool.query(query, );
            return result.rows;
        } catch (error) {
            logger.error('Current year analytics signals fetch failed', { error });
            throw error;
        }
    }
} 



import pool from '../config/database';
import logger from '../utils/logger';

export interface TradingSignal {
    id: number;
    symbol: string;
    ltp: number;
    signal: string;
    buy_target: number | null;
    sell_target: number | null;
    stop_loss: number | null;
    change_percent: number;
    created_at: Date;
}

export class TradingSignalModel {
    static async getTradingSignals(): Promise<TradingSignal[]> {
        try {
            const query = `
                SELECT 
                    id,
                    symbol,
                    ltp,
                    signal,
                    buy_target,
                    sell_target,
                    stop_loss,
                    change_percent,
                    created_at
                FROM trading_signals
                ORDER BY created_at DESC, symbol
            `;
            
            logger.debug('Fetching trading signals');
            const result = await pool.query(query);
            logger.debug('Trading signals fetched', { count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error('Trading signals fetch failed', { error });
            throw error;
        }
    }

    static async getTradingSignal(symbol: string): Promise<TradingSignal> {
        try {
            const query = `
                SELECT 
                    id,
                    symbol,
                    ltp,
                    signal,
                    buy_target,
                    sell_target,
                    stop_loss,
                    change_percent,
                    created_at
                FROM trading_signals
                where symbol = '${symbol}'
            `;
            
            logger.debug('Fetching trading signals');
            const result = await pool.query(query);
            logger.debug('Trading signals fetched', { count: result.rows.length });
            return result.rows[0];
        } catch (error) {
            logger.error('Trading signals fetch failed', { error });
            throw error;
        }
    }
} 
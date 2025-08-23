import pool from '../config/database';
import logger from '../utils/logger';

export interface AISignal {
    symbol: string;
    signal: string;
    buy_date: Date | null;
    buy_price: number | null;
    adj_buy_price: number | null;
    sold_date: Date | null;
    sold_price: number | null;
    current_strategy: string | null;
    point_change: number | null;
    profit_loss_pct: number | null;
    buy_range: string | null;
    sell_range: string | null;
    risk_reward_ratio: string | null;
    stop_loss: string | null;
    trade_result: string | null;
}

export class AISignalModel {
    static async getAISignals(): Promise<AISignal[]> {
        try {
            const query = `
                SELECT 
                    symbol,
                    signal,
                    buy_date,
                    buy_price,
                    adj_buy_price,
                    sold_date,
                    sold_price,
                    current_strategy,
                    point_change,
                    profit_loss_pct,
                    buy_range,
                    sell_range,
                    risk_reward_ratio,
                    stop_loss,
                    trade_result
                FROM ai_trading_signals_new
                ORDER BY 
                    CASE 
                        WHEN signal = 'BUY' THEN 1
                        WHEN signal = 'SELL' THEN 2
                        ELSE 3
                    END,
                    symbol
            `;
            
            logger.debug('Fetching AI signals');
            const result = await pool.query(query);
            logger.debug('AI signals fetched', { count: result.rows.length });
            
            // Log data quality issues only if they exist
            if (result.rows.length > 0) {
                const nullSymbolCount = result.rows.filter((row: AISignal) => !row.symbol).length;
                const nullSignalCount = result.rows.filter((row: AISignal) => !row.signal).length;
                const missingPriceCount = result.rows.filter((row: AISignal) => row.signal === 'BUY' && !row.buy_price).length;
                
                if (nullSymbolCount > 0 || nullSignalCount > 0 || missingPriceCount > 0) {
                    logger.warn('Data quality issues', {
                        nullSymbolCount,
                        nullSignalCount,
                        missingPriceCount
                    });
                }
            }
            
            return result.rows;
        } catch (error) {
            logger.error('AI signals fetch failed', { error });
            throw error;
        }
    }
} 
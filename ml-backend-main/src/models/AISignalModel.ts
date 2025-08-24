import pool from '../config/database';
import logger from '../utils/logger';

export interface AISignal {
    id: number;
    symbol: string;
    signal: string;
    buy_date?: Date;
    buy_price?: number;
    adj_buy_price?: number;
    sold_date?: Date;
    sold_price?: number;
    current_strategy?: string;
    point_change?: number;
    profit_loss_pct?: number;
    buy_range?: string;
    sell_range?: string;
    risk_reward_ratio?: string;
    stop_loss?: string;
    trade_result?: string;
}

export class AISignalModel {
    static async getAISignals(): Promise<AISignal[]> {
        try {
            const query = `
                SELECT 
                    id,
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

    static async getAISignalsPerSymbol(symbol: string): Promise<AISignal | undefined> {
        try {
            const query = `
                SELECT 
                    id,
                    symbol,
                    signal,
                    TO_CHAR(buy_date, 'YYYY-MM-DD') AS buy_date,
                    buy_price,
                    adj_buy_price,
                    TO_CHAR(sold_date, 'YYYY-MM-DD') AS sold_date,
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
                WHERE symbol = '${symbol}'
                LIMIT 1
            `;
            
            logger.debug('Fetching AI signals');
            const result = await pool.query(query);
            logger.debug('AI signals fetched', { count: result.rows.length });
            
            if(result.rows.length == 0){
                return undefined;
            }

            const resultData = result.rows[0];
            const transformedData = {
                id: resultData.id,
                symbol: resultData.symbol,
                signal: resultData.signal,
                buy_date: resultData.buy_date ?? "",
                buy_price: resultData.buy_price ?? "",
                adj_buy_price: resultData.adj_buy_price ?? 0,
                sold_date: resultData.sold_date ?? "",
                sold_price: resultData.sold_price ?? 0,
                current_strategy: resultData.current_strategy ?? "",
                point_change: resultData.point_change ?? 0,
                profit_loss_pct: resultData.profit_loss_pct ?? 0,
                buy_range: resultData.buy_range ?? "",
                sell_range: resultData.sell_range ?? "",
                risk_reward_ratio: resultData.risk_reward_ratio ?? "",
                stop_loss: resultData.stopLoss ?? "",
                trade_result: resultData.trade_result ?? ""
            }
            return transformedData;
        } catch (error) {
            logger.error('AI signals fetch failed', { error });
            throw error;
        }
    }
} 
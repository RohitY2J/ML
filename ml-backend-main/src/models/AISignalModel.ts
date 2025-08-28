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

export interface CurrentSignals {
    id: number;
    symbol: string;
    date: string;
    signal: any;
    direction: string;
    entry_price: number;
    exit_price?: number;
    exit_reason?: string;
    extras?: object;
    opened_at: string;
    closed_at?: string;
    quantity?: number;
    status: string;
    stop_price: number;
    tp_high: number;
    tp_low: number;
    confidence?: number;
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

    static async updateAISignalsPerSymbol(updateAISignal: CurrentSignals): Promise<CurrentSignals | undefined> {
        try {
            // Convert opened_at and closed_at to Date for database
            let openedAt: Date | null = null;
            if (updateAISignal.opened_at) {
                openedAt = new Date(updateAISignal.opened_at);
            }

            let closedAt: Date | null = null;
            if (updateAISignal.closed_at) {
                closedAt = new Date(updateAISignal.closed_at);
            }

            let signal: number | null = null;
            if (updateAISignal.signal === "BUY") {
                signal = 1;
            } else if (updateAISignal.signal === "SELL") {
                signal = -1;
            } else if (updateAISignal.signal === "HOLD") {
                signal = 0;
            } else if (typeof updateAISignal.signal === "number") {
                signal = updateAISignal.signal;
            }

            const query = `
                UPDATE signal_history_analytics
                SET
                    direction = $2,
                    entry_price = $3,
                    bb_low = $3,
                    exit_price = $4,
                    bb_high = $4,
                    exit_reason = $5,
                    extras = $6,
                    opened_at = $7,
                    closed_at = $8,
                    quantity = $9,
                    status = $10,
                    stop_price = $11,
                    tp_high = $12,
                    tp_low = $13,
                    confidence = $14,
                    signal = $15
                WHERE id = $1
                RETURNING
                    id,
                    symbol,
                    TO_CHAR(date, 'YYYY-MM-DD') AS date,
                    signal,
                    direction,
                    entry_price,
                    exit_price,
                    exit_reason,
                    extras,
                    TO_CHAR(opened_at, 'YYYY-MM-DD HH24:MI:SS') AS opened_at,
                    TO_CHAR(closed_at, 'YYYY-MM-DD HH24:MI:SS') AS closed_at,
                    quantity,
                    status,
                    stop_price,
                    tp_high,
                    tp_low,
                    confidence
            `;

            logger.debug('Updating AI signals');
            const result = await pool.query(query, [
                updateAISignal.id,
                updateAISignal.direction ?? '',
                updateAISignal.entry_price ?? null,
                updateAISignal.exit_price ?? null,
                updateAISignal.exit_reason ?? null,
                updateAISignal.extras ?? null,
                openedAt,
                closedAt,
                updateAISignal.quantity ?? null,
                updateAISignal.status ?? '',
                updateAISignal.stop_price ?? null,
                updateAISignal.tp_high ?? null,
                updateAISignal.tp_low ?? null,
                updateAISignal.confidence ?? null,
                signal
            ]);
            logger.debug('AI signals updated', { count: result.rows.length });

            if (result.rows.length === 0) {
                return undefined;
            }

            const resultData = result.rows[0];
            const transformedData: CurrentSignals = {
                id: resultData.id,
                symbol: resultData.symbol,
                date: resultData.date ?? '',
                signal: resultData.signal ?? null,
                direction: resultData.direction ?? '',
                entry_price: resultData.entry_price ?? null,
                exit_price: resultData.exit_price ?? null,
                exit_reason: resultData.exit_reason ?? null,
                extras: resultData.extras ?? null,
                opened_at: resultData.opened_at ?? null,
                closed_at: resultData.closed_at ?? null,
                quantity: resultData.quantity ?? null,
                status: resultData.status ?? '',
                stop_price: resultData.stop_price ?? null,
                tp_high: resultData.tp_high ?? null,
                tp_low: resultData.tp_low ?? null,
                confidence: resultData.confidence ?? null,
            };

            return transformedData;
        } catch (error) {
            logger.error('AI signals update failed', { error });
            throw error;
        }
    }

    static async getAISignalsPerSymbol(symbol: string, date: string): Promise<CurrentSignals | undefined> {
        try {
            const query = `
                    SELECT 
                        id,
                        symbol,
                        signal,
                        TO_CHAR(date, 'YYYY-MM-DD') AS date,
                        direction,
                        bb_low as entry_price,
                        bb_high as exit_price,
                        exit_reason,
                        extras,
                        opened_at,
                        closed_at,
                        quantity,
                        status,
                        stop_price,
                        tp_high,
                        tp_low,
                        confidence
                    FROM signal_history_analytics
                    WHERE symbol = '${symbol}' 
                    order by date desc
                    LIMIT 1;
                `;

            
            logger.debug('Fetching AI signals');
            const result = await pool.query(query);
            logger.debug('AI signals fetched', { count: result.rows.length });
            
            if(result.rows.length == 0){
                return undefined;
            }

            const resultData = result.rows[0];
            // const transformedData = {
            //     id: resultData.id,
            //     symbol: resultData.symbol,
            //     signal: resultData.signal,
            //     buy_date: resultData.buy_date ?? "",
            //     buy_price: resultData.buy_price ?? "",
            //     adj_buy_price: resultData.adj_buy_price ?? 0,
            //     sold_date: resultData.sold_date ?? "",
            //     sold_price: resultData.sold_price ?? 0,
            //     current_strategy: resultData.current_strategy ?? "",
            //     point_change: resultData.point_change ?? 0,
            //     profit_loss_pct: resultData.profit_loss_pct ?? 0,
            //     buy_range: resultData.buy_range ?? "",
            //     sell_range: resultData.sell_range ?? "",
            //     risk_reward_ratio: resultData.risk_reward_ratio ?? "",
            //     stop_loss: resultData.stopLoss ?? "",
            //     trade_result: resultData.trade_result ?? ""
            // }
            return resultData;
        } catch (error) {
            logger.error('AI signals fetch failed', { error });
            throw error;
        }
    }
} 
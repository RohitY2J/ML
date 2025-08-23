import pool from '../config/database';
import logger from '../utils/logger';

export interface TechnicalAnalysis {
    symbol: string;
    support_levels: {
        level: number;
        price: number;
    }[];
    resistance_levels: {
        level: number;
        price: number;
    }[];
    trend: {
        current_trend: string;
        strength: string;
    };
    indicators: {
        rsi: number;
        macd: string;
    };
    volume: {
        trend: string;
        vs_avg: number;
    };
    created_at: Date;
}

export class TechnicalAnalysisModel {
    static async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
        try {
            // Get latest technical data
            const latestDataQuery = `
                SELECT 
                    symbol,
                    date,
                    close,
                    sma_20,
                    sma_50,
                    rsi_14,
                    macd,
                    macd_signal,
                    CASE 
                        WHEN sma_20 > sma_50 THEN 'Bullish'
                        WHEN sma_20 < sma_50 THEN 'Bearish'
                        ELSE 'Neutral'
                    END as trend,
                    CASE 
                        WHEN sma_20 > sma_50 AND close > sma_20 THEN 'Strong'
                        WHEN sma_20 < sma_50 AND close < sma_20 THEN 'Strong'
                        ELSE 'Moderate'
                    END as strength,
                    CASE 
                        WHEN macd > macd_signal THEN 'Bullish'
                        ELSE 'Bearish'
                    END as macd_signal_value
                FROM signal_history_analytics
                WHERE symbol = $1
                ORDER BY date DESC
                LIMIT 1
            `;
            
            const latestDataResult = await pool.query(latestDataQuery, [symbol]);
            if (!latestDataResult.rows[0]) {
                throw new Error(`No technical data found for symbol ${symbol}`);
            }
            
            const latestData = latestDataResult.rows[0];
            
            // Get support levels
            const supportQuery = `
                SELECT 
                    zone_number as support_level,
                    bottom_price as support_price
                FROM support_zones
                WHERE symbol = $1
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY bottom_price
                LIMIT 3
            `;
            
            const supportResult = await pool.query(supportQuery, [symbol]);
            const supportLevels = supportResult.rows.map(row => ({
                level: row.support_level,
                price: row.support_price
            }));
            
            // Get resistance levels
            const resistanceQuery = `
                SELECT 
                    zone_number as resistance_level,
                    bottom_price as resistance_price
                FROM resistance_zones
                WHERE symbol = $1
                AND created_at >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY bottom_price
                LIMIT 3
            `;
            
            const resistanceResult = await pool.query(resistanceQuery, [symbol]);
            const resistanceLevels = resistanceResult.rows.map(row => ({
                level: row.resistance_level,
                price: row.resistance_price
            }));
            
            // Get volume analysis
            const volumeQuery = `
                WITH daily_volumes AS (
                    SELECT 
                        date,
                        volume,
                        AVG(volume) OVER (ORDER BY date ROWS BETWEEN 20 PRECEDING AND CURRENT ROW) as avg_volume
                    FROM daily_data
                    WHERE symbol = $1
                    ORDER BY date DESC
                    LIMIT 2
                )
                SELECT 
                    CASE 
                        WHEN volume > LAG(volume) OVER (ORDER BY date) THEN 'Increasing'
                        WHEN volume < LAG(volume) OVER (ORDER BY date) THEN 'Decreasing'
                        ELSE 'Stable'
                    END as trend,
                    ((volume - avg_volume) / avg_volume * 100) as vs_avg
                FROM daily_volumes
                ORDER BY date DESC
                LIMIT 1
            `;
            
            const volumeResult = await pool.query(volumeQuery, [symbol]);
            const volumeData = volumeResult.rows[0] || { trend: 'Stable', vs_avg: 0 };
            
            // Construct the result
            const result = {
                symbol: latestData.symbol,
                support_levels: supportLevels,
                resistance_levels: resistanceLevels,
                trend: {
                    current_trend: latestData.trend,
                    strength: latestData.strength
                },
                indicators: {
                    rsi: latestData.rsi_14,
                    macd: latestData.macd_signal_value
                },
                volume: {
                    trend: volumeData.trend,
                    vs_avg: Math.round(volumeData.vs_avg * 10) / 10
                },
                created_at: new Date()
            };
            
            logger.debug('Technical analysis fetched successfully');
            return result;
        } catch (error) {
            logger.error('Technical analysis fetch failed', { 
                error: error instanceof Error ? error.message : String(error), 
                stack: error instanceof Error ? error.stack : undefined,
                symbol 
            });
            throw error;
        }
    }
} 
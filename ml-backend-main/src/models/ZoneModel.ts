import pool from '../config/database';
import logger from '../utils/logger';

export interface Zone {
    zone_number: number;
    bottom_price: number;
    center_price: number;
    top_price: number;
}

export interface ZoneData {
    symbol: string;
    timeframe_days: number;
    support_zones: Zone[];
    resistance_zones: Zone[];
}

export class ZoneModel {
    static async getZones(symbol: string, timeframe_days: number): Promise<ZoneData> {
        try {
            // Get support zones
            const supportQuery = `
                SELECT zone_number, bottom_price, center_price, top_price
                FROM support_zones
                WHERE symbol = $1 AND timeframe_days = $2
                ORDER BY zone_number
            `;
            logger.debug('Fetching support zones', { symbol, timeframe_days });
            const supportResult = await pool.query(supportQuery, [symbol, timeframe_days]);

            // Get resistance zones
            const resistanceQuery = `
                SELECT zone_number, bottom_price, center_price, top_price
                FROM resistance_zones
                WHERE symbol = $1 AND timeframe_days = $2
                ORDER BY zone_number
            `;
            logger.debug('Fetching resistance zones', { symbol, timeframe_days });
            const resistanceResult = await pool.query(resistanceQuery, [symbol, timeframe_days]);

            logger.debug('Zones fetched', { 
                symbol, 
                timeframe_days,
                supportCount: supportResult.rows.length,
                resistanceCount: resistanceResult.rows.length
            });

            return {
                symbol,
                timeframe_days,
                support_zones: supportResult.rows,
                resistance_zones: resistanceResult.rows
            };
        } catch (error) {
            logger.error('Zones fetch failed', { symbol, timeframe_days, error });
            throw error;
        }
    }
} 
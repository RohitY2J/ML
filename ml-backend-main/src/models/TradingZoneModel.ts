import pool from '../config/database';
import logger from '../utils/logger';

export interface TradingZone {
    bottom_price: number;
    center_price: number;
    top_price: number;
}

export interface TradingZoneData {
    symbol: string;
    timeframe_days: number;
    immediate_demand_zone: TradingZone | null;
    immediate_supply_zone: TradingZone | null;
    stop_loss_zone: TradingZone | null;
}

export class TradingZoneModel {
    static async getTradingZones(symbol: string, timeframe_days: number): Promise<TradingZoneData> {
        try {
            const query = `
                SELECT zone_type, bottom_price, center_price, top_price
                FROM trading_zones
                WHERE symbol = $1 AND timeframe_days = $2
            `;
            logger.debug('Fetching trading zones', { symbol, timeframe_days });
            const result = await pool.query(query, [symbol, timeframe_days]);

            const zones: TradingZoneData = {
                symbol,
                timeframe_days,
                immediate_demand_zone: null,
                immediate_supply_zone: null,
                stop_loss_zone: null
            };

            result.rows.forEach(row => {
                const zone: TradingZone = {
                    bottom_price: row.bottom_price,
                    center_price: row.center_price,
                    top_price: row.top_price
                };

                switch (row.zone_type) {
                    case 'immediate_demand_zone':
                        zones.immediate_demand_zone = zone;
                        break;
                    case 'immediate_supply_zone':
                        zones.immediate_supply_zone = zone;
                        break;
                    case 'stop_loss_zone':
                        zones.stop_loss_zone = zone;
                        break;
                }
            });

            logger.debug('Trading zones fetched', { 
                symbol, 
                timeframe_days,
                zoneCount: result.rows.length
            });

            return zones;
        } catch (error) {
            logger.error('Trading zones fetch failed', { symbol, timeframe_days, error });
            throw error;
        }
    }
} 
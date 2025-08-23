import { ZoneData, ZoneModel } from '../models/ZoneModel';
import logger from '../utils/logger';

export async function getZones(symbol: string, timeframe_days: number): Promise<ZoneData> {
    try {
        logger.info('ZoneService: Fetching zones', { symbol, timeframe_days });
        const zones = await ZoneModel.getZones(symbol, timeframe_days);
        logger.info('ZoneService: Retrieved zones', { 
            symbol, 
            timeframe_days, 
            supportZonesCount: zones.support_zones.length,
            resistanceZonesCount: zones.resistance_zones.length 
        });
        return zones;
    } catch (error) {
        logger.error('Error in getZonesService:', { symbol, timeframe_days, error });
        throw error;
    }
} 
import { TradingZoneData, TradingZoneModel } from '../models/TradingZoneModel';
import logger from '../utils/logger';

export async function getTradingZones(symbol: string, timeframe_days: number): Promise<TradingZoneData> {
    try {
        logger.info('TradingZoneService: Fetching trading zones', { symbol, timeframe_days });
        const zones = await TradingZoneModel.getTradingZones(symbol, timeframe_days);
        logger.info('TradingZoneService: Retrieved trading zones', { 
            symbol, 
            timeframe_days,
            hasImmediateDemandZone: !!zones.immediate_demand_zone,
            hasImmediateSupplyZone: !!zones.immediate_supply_zone,
            hasStopLossZone: !!zones.stop_loss_zone
        });
        return zones;
    } catch (error) {
        logger.error('Error in getTradingZonesService:', { symbol, timeframe_days, error });
        throw error;
    }
} 
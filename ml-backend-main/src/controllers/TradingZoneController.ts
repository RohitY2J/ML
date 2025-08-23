import { Request, Response } from 'express';
import * as TradingZoneService from '../services/TradingZoneService';
import logger from '../utils/logger';
import { sendSuccess, sendValidationError, sendError } from '../utils/response';

export const getTradingZones = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const { timeframe } = req.query;

        logger.info('TradingZoneController: Received request for trading zones', { symbol, timeframe });

        if (!symbol) {
            logger.warn('TradingZoneController: Missing symbol parameter');
            return sendValidationError(res, 'Symbol is required');
        }

        if (!timeframe) {
            logger.warn('TradingZoneController: Missing timeframe parameter');
            return sendValidationError(res, 'Timeframe is required');
        }

        const timeframe_days = parseInt(timeframe as string);
        if (isNaN(timeframe_days)) {
            logger.warn('TradingZoneController: Invalid timeframe format', { timeframe });
            return sendValidationError(res, 'Invalid timeframe format');
        }

        logger.info('TradingZoneController: Fetching trading zones', { symbol, timeframe_days });
        const data = await TradingZoneService.getTradingZones(symbol, timeframe_days);
        
        logger.info('TradingZoneController: Successfully fetched trading zones', { symbol });
        sendSuccess(res, data, 'Trading zones retrieved successfully');
    } catch (error) {
        logger.error('TradingZoneController: Error fetching trading zones', { error });
        sendError(res, 'Failed to retrieve trading zones', 500, error);
    }
}; 
import { Request, Response } from 'express';
import * as ZoneService from '../services/ZoneService';
import logger from '../utils/logger';
import { sendSuccess, sendValidationError, sendError } from '../utils/response';

export const getZones = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const { timeframe } = req.query;

        if (!symbol) {
            logger.warn('ZoneController: Missing symbol parameter');
            return sendValidationError(res, 'Symbol is required');
        }

        if (!timeframe) {
            logger.warn('ZoneController: Missing timeframe parameter');
            return sendValidationError(res, 'Timeframe is required');
        }

        const timeframe_days = parseInt(timeframe as string);
        if (isNaN(timeframe_days)) {
            logger.warn('ZoneController: Invalid timeframe format', { timeframe });
            return sendValidationError(res, 'Invalid timeframe format');
        }

        logger.info('ZoneController: Fetching zones', { symbol, timeframe_days });
        const data = await ZoneService.getZones(symbol, timeframe_days);
        
        logger.info('ZoneController: Successfully fetched zones', { symbol });
        sendSuccess(res, data, 'Zones retrieved successfully');
    } catch (error) {
        logger.error('ZoneController: Error fetching zones', { error });
        sendError(res, 'Failed to retrieve zones', 500, error);
    }
}; 
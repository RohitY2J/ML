import { Request, Response } from 'express';
import * as TrendlineService from '../services/TrendlineService';
import logger from '../utils/logger';
import { sendSuccess, sendValidationError, sendError } from '../utils/response';

export const getTrendlines = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const { timeframe } = req.query;

        if (!symbol) {
            logger.warn('TrendlineController: Missing symbol parameter');
            return sendValidationError(res, 'Symbol is required');
        }

        if (!timeframe) {
            logger.warn('TrendlineController: Missing timeframe parameter');
            return sendValidationError(res, 'Timeframe is required');
        }

        const timeframe_days = parseInt(timeframe as string);
        if (isNaN(timeframe_days)) {
            logger.warn('TrendlineController: Invalid timeframe format', { timeframe });
            return sendValidationError(res, 'Invalid timeframe format');
        }

        logger.info('TrendlineController: Fetching trendlines', { symbol, timeframe_days });
        const data = await TrendlineService.getTrendlines(symbol, timeframe_days);
        
        logger.info('TrendlineController: Successfully fetched trendlines', { symbol });
        sendSuccess(res, data, 'Trendlines retrieved successfully');
    } catch (error) {
        logger.error('TrendlineController: Error fetching trendlines', { error });
        sendError(res, 'Failed to retrieve trendlines', 500, error);
    }
}; 
import { Request, Response } from 'express';
import * as TechnicalAnalysisService from '../services/TechnicalAnalysisService';
import logger from '../utils/logger';
import { sendSuccess, sendNotFound, sendError } from '../utils/response';

export const getTechnicalAnalysis = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return sendError(res, 'Symbol parameter is required', 400);
        }

        logger.info('TechnicalAnalysisController: Fetching technical analysis for symbol', { symbol });
        
        const analysis = await TechnicalAnalysisService.getTechnicalAnalysis(symbol as string);
        
        if (!analysis) {
            return sendNotFound(res, `No technical analysis found for symbol ${symbol}`);
        }

        logger.info('TechnicalAnalysisController: Successfully fetched technical analysis', { 
            symbol,
            trend: analysis['Trend Analysis']['Current Trend']
        });
        
        sendSuccess(res, analysis, 'Technical analysis retrieved successfully');
    } catch (error) {
        logger.error('TechnicalAnalysisController: Error fetching technical analysis', { error });
        sendError(res, 'Failed to retrieve technical analysis', 500, error);
    }
}; 
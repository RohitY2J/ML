import { Request, Response } from 'express';
import * as StockService from '../services/StockService';
import logger from '../utils/logger';
import { sendSuccess, sendValidationError, sendError } from '../utils/response';

export const getDailyData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate } = req.query;

    if (!symbol) {
      logger.warn('StockController: Missing symbol parameter');
      return sendValidationError(res, 'Symbol is required');
    }

    logger.info('StockController: Fetching daily data', { symbol, startDate, endDate });
    const data = await StockService.getDailyData(
      symbol,
      startDate as string,
      endDate as string
    );

    logger.info('StockController: Successfully fetched daily data', { symbol });
    sendSuccess(res, data, 'Daily stock data retrieved successfully');
  } catch (error) {
    logger.error('StockController: Error fetching daily data', { error });
    sendError(res, 'Failed to retrieve daily stock data', 500, error);
  }
};

export const getIntradayData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate } = req.query;

    if (!symbol) {
      logger.warn('StockController: Missing symbol parameter');
      return sendValidationError(res, 'Symbol is required');
    }

    logger.info('StockController: Fetching intraday data', { symbol, startDate, endDate });
    const data = await StockService.getIntradayData(
      symbol,
      startDate as string,
      endDate as string
    );

    logger.info('StockController: Successfully fetched intraday data', { symbol });
    sendSuccess(res, data, 'Intraday stock data retrieved successfully');
  } catch (error) {
    logger.error('StockController: Error fetching intraday data', { error });
    sendError(res, 'Failed to retrieve intraday stock data', 500, error);
  }
}; 
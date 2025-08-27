import { Request, Response } from 'express';
import * as TradingSignalService from '../services/TradingSignalService';
import * as AnalyticsSignalService from '../services/AnalyticsSignalService';
import logger from '../utils/logger';
import { sendSuccess, sendNotFound, sendError } from '../utils/response';

export const getTradingSignals = async (req: Request, res: Response) => {
    try {
        logger.info('TradingSignalController: Fetching trading signals');
        const signals = await TradingSignalService.getTradingSignals();
        
        if (!signals || signals.length === 0) {
            logger.warn('TradingSignalController: No trading signals found');
            return sendNotFound(res, 'No trading signals found');
        }

        logger.info('TradingSignalController: Successfully fetched trading signals', { count: signals.length });
        sendSuccess(res, signals, 'Trading signals retrieved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error fetching trading signals', { error });
        sendError(res, 'Failed to retrieve trading signals', 500, error);
    }
};

export const getCombinedSignals = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return sendError(res, 'Symbol parameter is required', 400);
        }

        logger.info('TradingSignalController: Fetching historical signals for symbol', { symbol });
        
        // Get historical analytics signals
        const analyticsSignals = await AnalyticsSignalService.getHistoricalSignals(symbol as string);
        
        if (!analyticsSignals || analyticsSignals.length === 0) {
            return sendNotFound(res, `No analytics data found for symbol ${symbol}`);
        }

        logger.info('TradingSignalController: Successfully fetched historical signals', { 
            symbol,
            signalCount: analyticsSignals.length
        });
        
        sendSuccess(res, analyticsSignals, 'Historical trading signals retrieved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error fetching historical signals', { error });
        sendError(res, 'Failed to retrieve historical signals', 500, error);
    }
};

export const getWatchList = async (req: Request, res: Response) => {
    try {
        
        const signals = await AnalyticsSignalService.getWatchList();
        sendSuccess(res, signals, 'WatchList signals retrieved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error fetching watchlist signals', { error });
        sendError(res, 'Failed to retrieve watchlist signals', 500, error);
    }
};

export const updateToWatchList = async (req: Request, res: Response) => {
    try {
        const {symbol, toAdd} = req.body;
        const signals = await AnalyticsSignalService.updateToWatchList(symbol, toAdd);
        sendSuccess(res, signals, 'Watchlist signals saved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error saving watchlist signals', { error });
        sendError(res, 'Failed to save watchlist signals', 500, error);
    }
};

export const updateTradingSignal = async (req: Request, res: Response) => {
    try {
        const {symbol, signal} = req.body;
        const response = await AnalyticsSignalService.updateTradingSignal(symbol, signal);
        sendSuccess(res, response, 'Watchlist signals saved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error saving watchlist signals', { error });
        sendError(res, 'Failed to save watchlist signals', 500, error);
    }
};


export const getTradingSignal = async (req: Request, res: Response) => {
    try {
        const {symbol} = req.params;
        const signal = await TradingSignalService.getTradingSignal(symbol);
        //const signal = signals.filter(s => s.symbol = symbol)[0];
        sendSuccess(res, signal, 'Watchlist signals saved successfully');
    } catch (error) {
        logger.error('TradingSignalController: Error saving watchlist signals', { error });
        sendError(res, 'Failed to save watchlist signals', 500, error);
    }
};

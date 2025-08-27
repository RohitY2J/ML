import { TradingSignal, TradingSignalModel } from '../models/TradingSignalModel';
import logger from '../utils/logger';

export async function getTradingSignals(): Promise<TradingSignal[]> {
    try {
        logger.info('TradingSignalService: Fetching trading signals');
        const signals = await TradingSignalModel.getTradingSignals();
        logger.info('TradingSignalService: Retrieved trading signals', { 
            count: signals.length,
            buySignals: signals.filter(s => s.signal === 'BUY').length,
            sellSignals: signals.filter(s => s.signal === 'SELL').length,
            holdSignals: signals.filter(s => s.signal === 'HOLD').length
        });
        return signals;
    } catch (error) {
        logger.error('Error in getTradingSignalsService:', { error });
        throw error;
    }
} 

export async function getTradingSignal(symbol: string): Promise<TradingSignal> {
    try {
        logger.info('TradingSignalService: Fetching trading signals');
        const signal = await TradingSignalModel.getTradingSignal(symbol);
        return signal;
    } catch (error) {
        logger.error('Error in getTradingSignalsService:', { error });
        throw error;
    }
} 
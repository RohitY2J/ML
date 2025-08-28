import { AISignal, AISignalModel, CurrentSignals } from '../models/AISignalModel';
import logger from '../utils/logger';

export async function getAISignals(): Promise<AISignal[]> {
    try {
        logger.info('AISignalService: Fetching AI signals');
        const signals = await AISignalModel.getAISignals();
        
        // Log signal distribution
        const buySignals = signals.filter(s => s.signal === 'BUY').length;
        const sellSignals = signals.filter(s => s.signal === 'SELL').length;
        const holdSignals = signals.filter(s => s.signal === 'HOLD').length;
        
        logger.info('AISignalService: Retrieved AI signals', { 
            count: signals.length,
            buySignals,
            sellSignals,
            holdSignals
        });
        
        // Log sample signals for debugging
        if (signals.length > 0) {
            logger.debug('AISignalService: Sample signals', {
                samples: signals.slice(0, 3).map(signal => ({
                    symbol: signal.symbol,
                    signal: signal.signal,
                    buyPrice: signal.buy_price,
                    stopLoss: signal.stop_loss
                }))
            });
        }
        
        return signals;
    } catch (error) {
        logger.error('Error in getAISignalsService:', { error });
        throw error;
    }
} 

export async function updateAISignal(updatedAISignal: CurrentSignals): Promise<CurrentSignals | undefined>{
    try {
        const signals = await AISignalModel.updateAISignalsPerSymbol(updatedAISignal);
        return signals;
    } catch (error) {
        logger.error('Error in getAISignalsService:', { error });
        throw error;
    }
}

export async function getAISignalsPerSymbol(symbol: string, date: string): Promise<CurrentSignals | undefined> {
    try {
        const signals = await AISignalModel.getAISignalsPerSymbol(symbol, date);
        return signals;
    } catch (error) {
        logger.error('Error in getAISignalsService:', { error });
        throw error;
    }
} 
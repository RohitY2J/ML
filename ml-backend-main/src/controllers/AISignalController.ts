import { Request, Response } from 'express';
import * as AISignalService from '../services/AISignalService';
import logger from '../utils/logger';
import { sendSuccess, sendNotFound, sendError } from '../utils/response';

export const getAISignals = async (req: Request, res: Response) => {
    try {
        logger.info('AISignalController: Starting AI trading signals request', {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            query: req.query
        });
        
        const signals = await AISignalService.getAISignals();
        
        if (!signals || signals.length === 0) {
            logger.warn('AISignalController: No AI trading signals found');
            return sendNotFound(res, 'No AI trading signals found');
        }

        logger.info('AISignalController: Formatting signals for response', { count: signals.length });
        
        // Format the data for the response
        const formattedSignals = signals.map(signal => ({
            Stock: signal.symbol,
            Signal: signal.signal === 'BUY' ? 'Buy' : signal.signal === 'SELL' ? 'Sell' : signal.signal,
            'Buy Date': signal.buy_date ? new Date(signal.buy_date).toISOString().split('T')[0] : '-',
            'Buy Price': signal.buy_price ? signal.buy_price : '-',
            'Adj. Buy Price': signal.adj_buy_price || '-',
            Sold: signal.sold_date ? new Date(signal.sold_date).toISOString().split('T')[0] : '-',
            'Sold Price': signal.sold_price || '-',
            'Current Strategy': signal.current_strategy || '-',
            'Point Change': signal.point_change || '-',
            'Profit/Loss%': signal.profit_loss_pct ? `${signal.profit_loss_pct}%` : '-',
            'Buy Range': signal.buy_range || '-',
            'Sell Range': signal.sell_range || '-',
            'Risk-To-Reward Ratio': signal.risk_reward_ratio || '-',
            'Stop Loss': signal.stop_loss || '-',
            'Trade Result': signal.trade_result || '-'
        }));

        // Log the count of signals by type
        const buyCount = formattedSignals.filter(s => s.Signal === 'Buy').length;
        const sellCount = formattedSignals.filter(s => s.Signal === 'Sell').length;
        const holdCount = formattedSignals.length - buyCount - sellCount;
        
        logger.info('AISignalController: Signal distribution', {
            total: formattedSignals.length,
            buyCount,
            sellCount,
            holdCount
        });
        
        // Log a sample of the formatted signals
        if (formattedSignals.length > 0) {
            logger.debug('AISignalController: Sample signals', {
                sample: formattedSignals.slice(0, 2)
            });
        }

        sendSuccess(res, formattedSignals, 'AI trading signals retrieved successfully');
        logger.info('AISignalController: Response sent successfully');
    } catch (error) {
        logger.error('AISignalController: Error fetching AI signals', { error });
        sendError(res, 'Failed to retrieve AI trading signals', 500, error);
    }
}; 
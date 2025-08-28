import { AnalyticsSignal, AnalyticsSignalModel, WatchListSignal } from '../models/AnalyticsSignalModel';
import logger from '../utils/logger';

export interface FormattedAnalyticsSignal {
    date: string;
    Stock: string;
    Signal: string;
    'Buy Date': string;
    'Buy Price': number | string;
    'Adj. Buy Price': string;
    Sold: string;
    'Sold Price': number | string;
    'Current Strategy': string;
    'Point Change': string;
    'Profit/Loss%': string;
    'Buy Range': string;
    'Sell Range': string;
    'Risk-To-Reward Ratio': string;
    'Stop Loss': number | string;
    'Trade Result': string;
    status: string;
    direction: string;
    entry_price: number;
    tp_low: number;
    tp_high: number;
    stop_price: number;
    opened_at: string;
    closed_at: string | null;
    exit_price: number | null;
    exit_reason: string | null;
    confidence?: number;
    quantity?: number;
    extras?: object;
    'Technical Indicators': {
        'SMA20': number;
        'SMA50': number;
        'EMA20': number;
        'MACD': number;
        'MACD Signal': number;
        'RSI': number;
        'Stochastic K': number;
        'Stochastic D': number;
        'BB High': number;
        'BB Low': number;
        'BB Mid': number;
        'VWAP': number;
    };
}

export async function getHistoricalSignals(symbol: string): Promise<FormattedAnalyticsSignal[]> {
    try {
        logger.info('AnalyticsSignalService: Fetching historical signals', { symbol });
        const signals = await AnalyticsSignalModel.getHistoricalSignals(symbol);
        
        const formattedSignals = signals.map(signal => ({
            date: `${signal.date.getFullYear()}-${signal.date.getMonth() + 1}-${signal.date.getDate()}`,
            Stock: signal.symbol,
            Signal: signal.signal === 1 ? 'BUY' : signal.signal === -1 ? 'SELL' : 'HOLD',
            'Buy Date': '-',//signal.buy_date || '-',
            'Buy Price': /*signal.entry_price ||*/ signal.bb_low || '-',
            'Adj. Buy Price':  '-',
            Sold: '-',
            'Sold Price': /*signal.exit_price ||*/ signal.bb_high || '-',
            'Current Strategy': 'Active',
            'Point Change': '-',
            'Profit/Loss%': typeof signal.change_percent === 'number' ? `${signal.change_percent.toFixed(2)}%` : '0.00%',
            'Buy Range': '-',
            'Sell Range': '-',
            'Risk-To-Reward Ratio': '-',
            'Stop Loss': signal.stop_price || signal.bb_low * 0.98 || '-',
            'Trade Result': '-',
            status: signal.status || 'RUNNING',
            direction: signal.direction,
            entry_price: signal.bb_low,//signal.entry_price,
            tp_low: signal.tp_low || 0.0,
            tp_high: signal.tp_high || 0.0,
            stop_price: signal.stop_price || signal.bb_low * 0.98 || 0.0,
            opened_at: signal.opened_at ? signal.opened_at : new Date().toISOString(),
            closed_at: signal.closed_at ? signal.closed_at : null,
            exit_price: signal.bb_high || null,//signal.exit_price || null,
            exit_reason: signal.exit_reason || null,
            confidence: signal.confidence,
            quantity: signal.quantity,
            extras: signal.extras,
            'Technical Indicators': {
                'SMA20': signal.sma_20,
                'SMA50': signal.sma_50,
                'EMA20': signal.ema_20,
                'MACD': signal.macd,
                'MACD Signal': signal.macd_signal,
                'RSI': signal.rsi_14,
                'Stochastic K': signal.stoch_k,
                'Stochastic D': signal.stoch_d,
                'BB High': signal.bb_high,
                'BB Low': signal.bb_low,
                'BB Mid': signal.bb_mid,
                'VWAP': signal.vwap
            }
        }));

        logger.info('AnalyticsSignalService: Retrieved historical signals', { 
            symbol,
            count: formattedSignals.length
        });
        
        return formattedSignals;
    } catch (error) {
        logger.error('Error in getHistoricalSignals:', { error, symbol });
        throw error;
    }
}



export async function getWatchList(): Promise<WatchListSignal[]> {
    try {
        const signals = await AnalyticsSignalModel.getWatchListSignal();
        return signals;
    } catch (error) {
        logger.error('Error in getHistoricalSignals:', { error });
        throw error;
    }
} 

export async function updateToWatchList(symbol: string, toAdd: boolean): Promise<WatchListSignal[]> {
    try {
        const signals = await AnalyticsSignalModel.updateToWatchList(symbol, toAdd);
        return signals;
    } catch (error) {
        logger.error('Error in getHistoricalSignals:', { error });
        throw error;
    }
} 


export async function updateTradingSignal(symbol: string, signal: string): Promise<string> {
    try {
        const signals = await AnalyticsSignalModel.updateTradingSignal(symbol, signal);
        return signals;
    } catch (error) {
        logger.error('Error in getHistoricalSignals:', { error });
        throw error;
    }
} 


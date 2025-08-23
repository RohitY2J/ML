import { TechnicalAnalysis, TechnicalAnalysisModel } from '../models/TechnicalAnalysisModel';
import logger from '../utils/logger';

export interface FormattedTechnicalAnalysis {
    symbol: string;
    'Support/Resistance Zones': {
        'Support Level 1': number;
        'Support Level 2': number;
        'Support Level 3': number;
        'Resistance Level 1': number;
        'Resistance Level 2': number;
        'Resistance Level 3': number;
    };
    'Trend Analysis': {
        'Current Trend': string;
        'Strength': string;
    };
    'Key Indicators': {
        'RSI (14)': number;
        'MACD': string;
    };
    'Volume Analysis': {
        'Volume Trend': string;
        'Volume vs Avg': string;
    };
}

export async function getTechnicalAnalysis(symbol: string): Promise<FormattedTechnicalAnalysis> {
    try {
        logger.info('TechnicalAnalysisService: Fetching technical analysis', { symbol });
        const analysis = await TechnicalAnalysisModel.getTechnicalAnalysis(symbol);
        
        const formattedAnalysis: FormattedTechnicalAnalysis = {
            symbol: analysis.symbol,
            'Support/Resistance Zones': {
                'Support Level 1': analysis.support_levels[0]?.price || 0,
                'Support Level 2': analysis.support_levels[1]?.price || 0,
                'Support Level 3': analysis.support_levels[2]?.price || 0,
                'Resistance Level 1': analysis.resistance_levels[0]?.price || 0,
                'Resistance Level 2': analysis.resistance_levels[1]?.price || 0,
                'Resistance Level 3': analysis.resistance_levels[2]?.price || 0
            },
            'Trend Analysis': {
                'Current Trend': analysis.trend.current_trend,
                'Strength': analysis.trend.strength
            },
            'Key Indicators': {
                'RSI (14)': Number(analysis.indicators.rsi || 0),
                'MACD': analysis.indicators.macd
            },
            'Volume Analysis': {
                'Volume Trend': analysis.volume.trend,
                'Volume vs Avg': `${analysis.volume.vs_avg > 0 ? '+' : ''}${analysis.volume.vs_avg}%`
            }
        };

        logger.info('TechnicalAnalysisService: Retrieved technical analysis', { symbol });
        return formattedAnalysis;
    } catch (error) {
        logger.error('Error in getTechnicalAnalysis:', { error, symbol });
        throw error;
    }
} 
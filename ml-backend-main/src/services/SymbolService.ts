import { Symbol, SymbolModel } from '../models/SymbolModel';
import logger from '../utils/logger';

export async function getAllSymbols(): Promise<Symbol[]> {
  try {
    logger.info('SymbolService: Fetching all symbols');
    const symbols = await SymbolModel.getAllSymbols();
    logger.info('SymbolService: Retrieved symbols:', symbols);
    return symbols;
  } catch (error) {
    console.error('Error in getAllSymbolsService:', error);
    throw error;
  }
} 
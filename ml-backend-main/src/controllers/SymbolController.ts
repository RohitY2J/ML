import { Request, Response } from 'express';
import * as SymbolService from '../services/SymbolService';

export async function getAllSymbols(req: Request, res: Response) {
  try {
    console.log('SymbolController: Fetching all symbols');
    const symbols = await SymbolService.getAllSymbols();
    console.log('SymbolController: Retrieved symbols:', symbols);
    
    res.json({
      success: true,
      data: symbols,
      message: 'Symbols retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAllSymbols controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve symbols',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 

export async function getNotWatchedSymbols(req: Request, res: Response) {
  try {
    console.log('SymbolController: Fetching not watched symbols');
    const symbols = await SymbolService.getAllSymbols();
    const filteredSymbols = symbols.filter(symbol => !symbol.is_watched)

    const mappedSymbols = filteredSymbols.map(filteredSymbol => {
       return {
        symbol: filteredSymbol.symbol,
        name: ""
       }
    })
    console.log('SymbolController: Retrieved symbols:', symbols);
    
    res.json({
      success: true,
      data: mappedSymbols,
      message: 'Symbols retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAllSymbols controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve symbols',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
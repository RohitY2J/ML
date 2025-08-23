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
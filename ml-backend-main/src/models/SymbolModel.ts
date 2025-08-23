import pool from '../config/database';

export interface Symbol {
  id: number;
  symbol: string;
  created_at: Date;
}

export class SymbolModel {
  static async getAllSymbols(): Promise<Symbol[]> {
    const query = `
      SELECT id, symbol, created_at
      FROM symbols
      ORDER BY symbol ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
} 
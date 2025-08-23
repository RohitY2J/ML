import { Router } from 'express';
import { getAllSymbols } from '../controllers/SymbolController';

const router = Router();

// Get all symbols
router.get('/', getAllSymbols);

export default router; 
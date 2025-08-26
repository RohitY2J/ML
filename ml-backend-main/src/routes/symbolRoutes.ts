import { Router } from 'express';
import { getAllSymbols, getNotWatchedSymbols } from '../controllers/SymbolController';

const router = Router();

// Get all symbols
router.get('/', getAllSymbols);
router.get('/getNotWatchedSymbols', getNotWatchedSymbols);

export default router; 
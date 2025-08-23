import { Router } from 'express';
import * as StockController from '../controllers/StockController';
import { validate } from '../middleware/validation';
import { stockDetailSchema } from '../validations/schemas';

const router = Router();

// Get daily data for a symbol
router.get('/daily/:symbol', validate(stockDetailSchema), StockController.getDailyData);

// Get intraday data for a symbol
router.get('/intraday/:symbol', validate(stockDetailSchema), StockController.getIntradayData);

export default router; 
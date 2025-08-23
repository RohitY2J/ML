import { Router } from 'express';
import * as TradingSignalController from '../controllers/TradingSignalController';
import { validate } from '../middleware/validation';
import { tradingSignalSchema } from '../validations/schemas';

const router = Router();

// Get regular trading signals
router.get('/trading-signals', validate(tradingSignalSchema), TradingSignalController.getTradingSignals);

// Get combined trading signals (both traditional and AI)
router.get('/combined-signals', validate(tradingSignalSchema), TradingSignalController.getCombinedSignals);

export default router; 
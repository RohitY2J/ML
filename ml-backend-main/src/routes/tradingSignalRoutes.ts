import { Router } from 'express';
import * as TradingSignalController from '../controllers/TradingSignalController';
import { validate } from '../middleware/validation';
import { tradingSignalSchema, tradingZoneSchema } from '../validations/schemas';

const router = Router();

// Get regular trading signals
router.get('/trading-signals', validate(tradingSignalSchema), TradingSignalController.getTradingSignals);

// Get combined trading signals (both traditional and AI)
router.get('/combined-signals', validate(tradingSignalSchema), TradingSignalController.getCombinedSignals);

router.get('/getWatchList', validate(tradingSignalSchema), TradingSignalController.getWatchList);

router.post('/updateToWatchList', validate(tradingSignalSchema), TradingSignalController.updateToWatchList);

router.get('/getTradingSignal/:symbol', validate(tradingSignalSchema), TradingSignalController.getTradingSignal)

router.post('/updateTradingSignal', validate(tradingSignalSchema), TradingSignalController.updateTradingSignal);

export default router; 
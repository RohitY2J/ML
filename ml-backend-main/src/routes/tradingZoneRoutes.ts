import { Router } from 'express';
import * as TradingZoneController from '../controllers/TradingZoneController';
import { validate } from '../middleware/validation';
import { tradingZoneSchema } from '../validations/schemas';

const router = Router();

// Get trading zones for a symbol and timeframe
router.get('/:symbol', validate(tradingZoneSchema), TradingZoneController.getTradingZones);

export default router; 
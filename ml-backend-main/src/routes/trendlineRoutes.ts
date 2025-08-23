import { Router } from 'express';
import * as TrendlineController from '../controllers/TrendlineController';
import { validate } from '../middleware/validation';
import { trendlineSchema } from '../validations/schemas';

const router = Router();

// Get trendlines for a symbol and timeframe
router.get('/:symbol', validate(trendlineSchema), TrendlineController.getTrendlines);

export default router; 
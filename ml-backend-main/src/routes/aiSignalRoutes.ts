import { Router } from 'express';
import * as AISignalController from '../controllers/AISignalController';
import { validate } from '../middleware/validation';
import { aiSignalSchema } from '../validations/schemas';

const router = Router();

// Get AI trading signals
router.get('/', validate(aiSignalSchema), AISignalController.getAISignals);
router.get('/:symbol', validate(aiSignalSchema), AISignalController.getAISignalsPerSymbolAsync)
router.post('/updateAISignal', AISignalController.updateAISignals);

export default router; 
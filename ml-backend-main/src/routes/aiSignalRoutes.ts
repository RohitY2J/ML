import { Router } from 'express';
import * as AISignalController from '../controllers/AISignalController';
import { validate } from '../middleware/validation';
import { aiSignalSchema } from '../validations/schemas';

const router = Router();

// Get AI trading signals
router.get('/ai-signals', validate(aiSignalSchema), AISignalController.getAISignals);

export default router; 
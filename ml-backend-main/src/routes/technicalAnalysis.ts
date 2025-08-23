import { Router } from 'express';
import * as TechnicalAnalysisController from '../controllers/TechnicalAnalysisController';
import { validate } from '../middleware/validation';
import { technicalAnalysisSchema } from '../validations/schemas';

const router = Router();

// Get technical analysis for a symbol
router.get('/', validate(technicalAnalysisSchema), TechnicalAnalysisController.getTechnicalAnalysis);

export default router; 
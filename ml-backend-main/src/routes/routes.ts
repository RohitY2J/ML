import { Router } from 'express';
import stockRoutes from './stockRoutes';
import zoneRoutes from './zoneRoutes';
import trendlineRoutes from './trendlineRoutes';
import tradingZoneRoutes from './tradingZoneRoutes';
import symbolRoutes from './symbolRoutes';
import tradingSignalRoutes from './tradingSignalRoutes';
import technicalAnalysisRoutes from './technicalAnalysis';

const router = Router();

// API Routes
router.use('/stocks', stockRoutes);
router.use('/zones', zoneRoutes);
router.use('/trendlines', trendlineRoutes);
router.use('/trading-zones', tradingZoneRoutes);
router.use('/symbols', symbolRoutes);
router.use('/signals', tradingSignalRoutes);
router.use('/technical-analysis', technicalAnalysisRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router; 
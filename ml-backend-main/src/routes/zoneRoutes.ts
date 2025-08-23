import { Router } from 'express';
import * as ZoneController from '../controllers/ZoneController';

const router = Router();

// Get both support and resistance zones for a symbol and timeframe
router.get('/:symbol', ZoneController.getZones);

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Zone routes are working' });
});

export default router; 
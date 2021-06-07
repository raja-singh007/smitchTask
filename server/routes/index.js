import express from 'express';

import healthCtrl from '../controllers/health';

import authRoutes from './auth';
import devicesRoutes from './devices';

const router = express.Router();

/**Service Health Check API */
router.get('/health-check', healthCtrl.checkConnection);

/* Mounting auth routes @ /auth */
router.use('/auth', authRoutes);

/* Mounting teacher routes @ /devices */
// router.use('/devices', devicesRoutes);

export default router;
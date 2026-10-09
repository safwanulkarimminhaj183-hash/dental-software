import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get dashboard metrics & chart datasets
router.get('/', getDashboardAnalytics);

export default router;

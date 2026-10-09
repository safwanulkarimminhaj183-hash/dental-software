import express from 'express';
import {
  getServiceDetails,
  getAllServices,
  getServiceAnalyticsSummary,
} from '../controllers/serviceController.js';
import optionalAuth from '../middlewares/optionalAuth.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Analytics Summary (Admin / Marketing) ──────────────────────────────────
router.get(
  '/analytics/summary',
  protect,
  authorize('super_admin', 'doctor', 'receptionist'),
  getServiceAnalyticsSummary
);

// ─── Public Service Listing ──────────────────────────────────────────────────
// GET /api/services
router.get('/', getAllServices);

// ─── Service Details Flow ────────────────────────────────────────────────────
// GET /api/services/:id  (e.g., 105, "root-canal", or ObjectId)
// Triggered when a user clicks on any service card or detail button
router.get('/:id', optionalAuth, getServiceDetails);

export default router;

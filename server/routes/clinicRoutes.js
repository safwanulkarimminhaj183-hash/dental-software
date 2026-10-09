import express from 'express';
import {
  getClinicInfo,
  createClinicInfo,
  updateClinicInfo,
} from '../controllers/clinicController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET  /api/clinic-info  — public clinic profile for About Us → Our Clinic
router.get('/', getClinicInfo);

// POST /api/clinic-info  — create clinic profile (admin)
router.post('/', protect, authorize('super_admin'), createClinicInfo);

// PUT  /api/clinic-info  — update clinic profile (admin)
router.put('/', protect, authorize('super_admin'), updateClinicInfo);

export default router;

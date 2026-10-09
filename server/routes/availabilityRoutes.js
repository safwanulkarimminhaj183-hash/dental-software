import express from 'express';
import {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability
} from '../controllers/availabilityController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for patients to check dentist availability
router.get('/', getAllAvailabilities);
router.get('/:id', getAvailabilityById);

// Protected routes for dentists and administrators to organize availability schedule
router.post('/', protect, authorize('super_admin', 'doctor'), createAvailability);
router.put('/:id', protect, authorize('super_admin', 'doctor'), updateAvailability);
router.delete('/:id', protect, authorize('super_admin', 'doctor'), deleteAvailability);

export default router;

import express from 'express';
import {
  getAllSpecialists,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  updateSpecialistProfile,
  toggleSpecialistStatus,
  deleteSpecialist,
  getSpecialistSchedule,
  saveSpecialistSchedule,
  blockSpecialistDate,
  getSpecialistEarnings,
} from '../controllers/specialistController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Public & Portal Routes ──────────────────────────────────────────────────
router.get('/', getAllSpecialists);
router.get('/:id/schedule', getSpecialistSchedule);
router.get('/:id/earnings', getSpecialistEarnings);
router.get('/:id', getSpecialistById);

// Schedule & Availability controls
router.post('/:id/schedule', saveSpecialistSchedule);
router.put('/:id/schedule', saveSpecialistSchedule);
router.put('/:id/block-date', blockSpecialistDate);
router.put('/:id/profile', updateSpecialistProfile);

// CMS & Specialist Management
router.post('/', createSpecialist);
router.put('/:id', updateSpecialist);
router.patch('/:id/profile', updateSpecialistProfile);
router.patch('/:id/status', toggleSpecialistStatus);
router.delete('/:id', deleteSpecialist);

export default router;

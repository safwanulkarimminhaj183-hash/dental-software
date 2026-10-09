import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { appointmentValidationRules, validate } from '../middleware/validators.js';
import { formSubmissionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/appointment OR POST /api/appointments
// @desc    Book an appointment (Rate limited & Validated)
router.post('/', formSubmissionLimiter, appointmentValidationRules, validate, createAppointment);

// @route   GET /api/appointments OR GET /api/appointment
// @desc    Fetch all appointments with filters
router.get('/', getAllAppointments);

// @route   PATCH /api/appointments/:id/status OR PATCH /api/appointments/:id
// @desc    Update appointment status
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id', updateAppointmentStatus);

// Single appointment management
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;

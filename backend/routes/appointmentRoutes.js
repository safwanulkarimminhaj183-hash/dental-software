// backend/routes/appointmentRoutes.js
import express from 'express';
import {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  cancelAppointment,
  getAllAppointments,
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// ── Patient-facing ────────────────────────────────────────────────────────────

/**
 * GET /api/appointments/available-slots?doctorId=...&date=YYYY-MM-DD
 * Returns open time slots for a given doctor on a given date.
 * Accessible to any authenticated user (patient looking to book).
 */
router.get('/available-slots', getAvailableSlots);

/**
 * POST /api/appointments/book
 * Body: { doctorId, slot (ISO string), reason? }
 * Books an appointment using a MongoDB transaction + unique index to prevent
 * double-booking. Returns 409 if the slot was taken concurrently.
 */
router.post('/book', auditLogger('BOOK_APPOINTMENT'), bookAppointment);

/**
 * GET /api/appointments/my
 * Returns all appointments for the authenticated patient, newest first.
 */
router.get('/my', auditLogger('READ_MY_APPOINTMENTS'), getMyAppointments);

/**
 * PATCH /api/appointments/:id/cancel
 * Body: { reason? }
 * Patients cancel their own; staff/admin can cancel any.
 */
router.patch('/:id/cancel', auditLogger('CANCEL_APPOINTMENT'), cancelAppointment);

// ── Admin / Staff dashboard ───────────────────────────────────────────────────

/**
 * GET /api/appointments/all?status=&doctorId=&date=&page=&limit=
 * Full paginated appointment list for the admin dashboard.
 */
router.get(
  '/all',
  authorize('admin', 'staff'),
  auditLogger('READ_ALL_APPOINTMENTS'),
  getAllAppointments
);

export default router;

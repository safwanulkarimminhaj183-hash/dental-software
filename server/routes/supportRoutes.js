import express from 'express';
import {
  submitTicket,
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
  getFAQ,
} from '../controllers/supportController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// POST /api/support/submit
// → Called when the "About Us → Patient Help" form is submitted
router.post('/submit', submitTicket);

// GET /api/support/faq
// → Public FAQ list shown on the Patient Help page
router.get('/faq', getFAQ);

// ── Protected Routes (admin / receptionist) ───────────────────────────────────

// GET /api/support/tickets → all tickets with filters + summary
router.get(
  '/tickets',
  protect,
  authorize('super_admin', 'receptionist'),
  getAllTickets
);

// GET /api/support/tickets/:id → single ticket with full thread
router.get(
  '/tickets/:id',
  protect,
  authorize('super_admin', 'receptionist'),
  getTicketById
);

// POST /api/support/tickets/:id/reply → admin sends a reply
router.post(
  '/tickets/:id/reply',
  protect,
  authorize('super_admin', 'receptionist'),
  replyToTicket
);

// PATCH /api/support/tickets/:id/status → update ticket status
router.patch(
  '/tickets/:id/status',
  protect,
  authorize('super_admin', 'receptionist'),
  updateTicketStatus
);

// DELETE /api/support/tickets/:id → hard delete (super_admin only)
router.delete(
  '/tickets/:id',
  protect,
  authorize('super_admin'),
  deleteTicket
);

export default router;

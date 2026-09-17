// backend/routes/supportRoutes.js
//
// ─── About Us → Patient Help Integration ─────────────────────────────────────
//
// When a user clicks "About Us → Patient Help" on the frontend, the form
// submissions are directed to POST /api/support/submit.
//
// Flow:
//   1. Frontend renders the Patient Help form (subject, message, contact info).
//   2. On submit, the frontend POSTs to POST /api/support/submit.
//      — Authenticated patients: token in Authorization header.
//      — Guests: no token; guestEmail is required in the body.
//   3. This route invokes submitTicket(), which:
//        a. Persists the ticket + first message.
//        b. Runs FAQ auto-reply check (instant response for common questions).
//        c. Emits a Socket.io event to the admin dashboard room.
//        d. Returns the ticket (with any auto-reply text) to the frontend.
//   4. The frontend displays the auto-reply immediately (if any) and confirms
//      the ticket was received.
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import {
  submitTicket,
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  getMyTickets,
} from '../controllers/supportController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { supportLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// ── Public / Guest-accessible ─────────────────────────────────────────────────

/**
 * POST /api/support/submit
 * PRIMARY ENDPOINT — triggered by the "About Us → Patient Help" form.
 * optionalAuth: attaches req.user if a valid JWT is present, otherwise
 * treats the request as a guest submission (guestEmail required).
 *
 * Rate-limited to 5 submissions per 10 min per IP to prevent spam.
 *
 * Body:
 *   { subject, message, category?, guestName?, guestEmail?, guestPhone? }
 *
 * Returns:
 *   { ticketId, autoReplied, autoReplyMessage, ticket }
 */
router.post(
  '/submit',
  supportLimiter,
  optionalAuth,
  auditLogger('SUBMIT_SUPPORT_TICKET'),
  submitTicket
);

// ── Authenticated patient ─────────────────────────────────────────────────────

/**
 * GET /api/support/my-tickets
 * All tickets submitted by the authenticated patient.
 */
router.get('/my-tickets', protect, auditLogger('READ_MY_TICKETS'), getMyTickets);

/**
 * POST /api/support/tickets/:id/reply
 * Patient or admin adds a message to the ticket thread.
 * Body: { message }
 */
router.post(
  '/tickets/:id/reply',
  protect,
  auditLogger('REPLY_TO_TICKET'),
  replyToTicket
);

/**
 * GET /api/support/tickets/:id
 * Fetch a single ticket with its full message thread.
 * Accessible to the owning patient or admin/staff.
 */
router.get(
  '/tickets/:id',
  protect,
  auditLogger('READ_TICKET'),
  getTicketById
);

// ── Admin / Staff dashboard ───────────────────────────────────────────────────

/**
 * GET /api/support/tickets
 * Paginated list of all tickets. Admin/staff only.
 * Query: status, category, search, page, limit
 */
router.get(
  '/tickets',
  protect,
  authorize('admin', 'staff'),
  auditLogger('LIST_ALL_TICKETS'),
  getAllTickets
);

/**
 * PATCH /api/support/tickets/:id/status
 * Update ticket status and/or assignee. Admin/staff only.
 * Body: { status?, assignedTo? }
 */
router.patch(
  '/tickets/:id/status',
  protect,
  authorize('admin', 'staff'),
  auditLogger('UPDATE_TICKET_STATUS'),
  updateTicketStatus
);

export default router;

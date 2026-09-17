// backend/routes/billingRoutes.js
import express from 'express';
import {
  initiatePayment,
  downloadInvoice,
  getMyInvoices,
  getInvoiceById,
  getAllInvoices,
} from '../controllers/billingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';
import { paymentLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All billing routes require authentication
router.use(protect);

// ── Payments ──────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/initiate
 * Initiates a payment via bKash, Nagad, or card (Stripe).
 * Creates an Invoice document and a Billing transaction record.
 * Body: { patientId, appointmentId?, amount, method, paymentDetails?,
 *         items?, discount?, notes? }
 *
 * Supported methods: 'bkash' | 'nagad' | 'card'
 * Rate-limited to 10 attempts per 15 min per IP.
 */
router.post(
  '/payments/initiate',
  paymentLimiter,
  auditLogger('INITIATE_PAYMENT'),
  initiatePayment
);

// ── Invoices ──────────────────────────────────────────────────────────────────

/**
 * GET /api/invoices
 * All invoices — admin/staff dashboard, supports filtering by status/patientId.
 * Query: status, patientId, page, limit
 */
router.get(
  '/invoices',
  authorize('admin', 'staff'),
  auditLogger('LIST_ALL_INVOICES'),
  getAllInvoices
);

/**
 * GET /api/invoices/my
 * All invoices for the authenticated patient.
 */
router.get('/invoices/my', auditLogger('READ_MY_INVOICES'), getMyInvoices);

/**
 * GET /api/invoices/:id
 * Single invoice detail. Patient can view own; admin/staff can view any.
 */
router.get('/:id', auditLogger('READ_INVOICE'), getInvoiceById);

/**
 * GET /api/invoices/:id/download
 * Streams a dynamically generated PDF receipt.
 * Patient can download own invoice; admin/staff can download any.
 */
router.get('/:id/download', auditLogger('DOWNLOAD_INVOICE'), downloadInvoice);

export default router;

import express from 'express';
import {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBilling,
  recordPayment,
  getTreatmentFees,
  deleteBilling,
} from '../controllers/billingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/billing/fees  — treatment procedure price catalog (public-facing pricing page)
router.get('/fees', getTreatmentFees);

// ─── Protected Routes (receptionist / admin) ─────────────────────────────────
// GET  /api/billing             — list invoices with filters + summary totals
// POST /api/billing             — create new invoice
router.get('/', protect, authorize('super_admin', 'receptionist'), getAllBilling);
router.post('/', protect, authorize('super_admin', 'receptionist'), createBilling);

// GET  /api/billing/:id         — single invoice by ID or invoiceNumber
// PUT  /api/billing/:id         — update invoice (triggers totals recalc)
// DELETE /api/billing/:id       — delete invoice (super_admin only)
router.get('/:id', protect, authorize('super_admin', 'receptionist'), getBillingById);
router.put('/:id', protect, authorize('super_admin', 'receptionist'), updateBilling);
router.delete('/:id', protect, authorize('super_admin'), deleteBilling);

// PATCH /api/billing/:id/payment — record a payment against an invoice
router.patch('/:id/payment', protect, authorize('super_admin', 'receptionist'), recordPayment);

export default router;

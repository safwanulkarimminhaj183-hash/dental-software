// backend/routes/galleryRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// Route definitions for Smile Gallery & Case Management Back-End
// Backs the "About Us → Smile Gallery" section
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import {
  getPublicGallery,
  getCaseById,
  likeCase,
  getGalleryCategories,
  createCase,
  getAdminCases,
  updateCase,
  reviewCase,
  deleteCase,
  toggleFeatured,
} from '../controllers/galleryController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { uploadCaseImages } from '../middlewares/uploadMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';

const router = express.Router();

// ── Public Endpoints (Triggered when user clicks "About Us → Smile Gallery") ──
// GET  /api/gallery             - Fetch & filter cases by category, tag, search, sort
// GET  /api/gallery/categories  - Fetch category badges with published case counts
// GET  /api/gallery/:id         - View single case details / modal (increments view)
// POST /api/gallery/:id/like    - Like/upvote a smile transformation
router.get('/', getPublicGallery);
router.get('/categories', getGalleryCategories);
router.get('/:id', getCaseById);
router.post('/:id/like', likeCase);

// ── Protected CMS & Admin Panel Endpoints ────────────────────────────────────
// Assistants (staff) can upload cases awaiting review; Lead Doctors/Admins approve
router.get(
  '/admin/cases',
  protect,
  authorize('admin', 'staff'),
  auditLogger('READ_ADMIN_GALLERY_CASES'),
  getAdminCases
);

router.post(
  '/',
  protect,
  authorize('admin', 'staff'),
  uploadCaseImages,
  auditLogger('CREATE_GALLERY_CASE'),
  createCase
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'staff'),
  uploadCaseImages,
  auditLogger('UPDATE_GALLERY_CASE'),
  updateCase
);

// Lead Doctor / Admin Approval Workflow
router.patch(
  '/:id/review',
  protect,
  authorize('admin'),
  auditLogger('REVIEW_GALLERY_CASE'),
  reviewCase
);

router.patch(
  '/:id/feature',
  protect,
  authorize('admin'),
  auditLogger('TOGGLE_FEATURED_GALLERY_CASE'),
  toggleFeatured
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  auditLogger('DELETE_GALLERY_CASE'),
  deleteCase
);

export default router;

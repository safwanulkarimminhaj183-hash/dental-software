import express from 'express';
import {
  getPublicGallery,
  getPublicCaseById,
  adminGetAllCases,
  createCase,
  updateCase,
  replaceCaseImages,
  approveCase,
  rejectCase,
  archiveCase,
  deleteCase,
  toggleFeatured,
} from '../../controllers/gallery/smileGalleryController.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';
import {
  galleryMulter,
  processGalleryImages,
} from '../../middlewares/galleryUpload.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// Triggered when "About Us → Smile Gallery" is accessed on the frontend.
// No authentication required — returns only status:'approved' cases.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/gallery
// → Main gallery page load: approved cases with category/tag/featured filters
router.get('/', getPublicGallery);

// GET /api/gallery/:id
// → Single case detail view (increments viewCount)
router.get('/:id', getPublicCaseById);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / CMS ROUTES — all protected
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/gallery/admin/cases
// → Dashboard: all cases with status filter, search, pagination
router.get(
  '/admin/cases',
  protect,
  authorize('super_admin', 'doctor', 'receptionist'),
  adminGetAllCases
);

// POST /api/gallery/admin/cases
// → Upload new smile case (multer → sharp pipeline → controller)
router.post(
  '/admin/cases',
  protect,
  authorize('super_admin', 'doctor', 'receptionist'),
  galleryMulter,           // 1. parse multipart, store in memory
  processGalleryImages,    // 2. resize → WebP → watermark → save files
  createCase               // 3. save metadata to MongoDB
);

// PUT /api/gallery/admin/cases/:id
// → Update case text fields (title, description, category, tags etc.)
router.put(
  '/admin/cases/:id',
  protect,
  authorize('super_admin', 'doctor', 'receptionist'),
  updateCase
);

// PATCH /api/gallery/admin/cases/:id/images
// → Replace before/after images on existing case
router.patch(
  '/admin/cases/:id/images',
  protect,
  authorize('super_admin', 'doctor'),
  galleryMulter,
  processGalleryImages,
  replaceCaseImages
);

// PATCH /api/gallery/admin/cases/:id/approve
// → Lead doctor / super_admin approves pending case → goes live
router.patch(
  '/admin/cases/:id/approve',
  protect,
  authorize('super_admin', 'doctor'),
  approveCase
);

// PATCH /api/gallery/admin/cases/:id/reject
// → Reject with reason (body: { reason })
router.patch(
  '/admin/cases/:id/reject',
  protect,
  authorize('super_admin', 'doctor'),
  rejectCase
);

// PATCH /api/gallery/admin/cases/:id/archive
// → Soft-hide case from gallery without permanent deletion
router.patch(
  '/admin/cases/:id/archive',
  protect,
  authorize('super_admin', 'doctor', 'receptionist'),
  archiveCase
);

// PATCH /api/gallery/admin/cases/:id/feature
// → Toggle isFeatured flag
router.patch(
  '/admin/cases/:id/feature',
  protect,
  authorize('super_admin', 'doctor'),
  toggleFeatured
);

// DELETE /api/gallery/admin/cases/:id
// → Hard delete case + remove image files from disk (super_admin only)
router.delete(
  '/admin/cases/:id',
  protect,
  authorize('super_admin'),
  deleteCase
);

export default router;

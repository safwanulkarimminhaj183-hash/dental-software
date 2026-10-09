import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  likeBlog,
  getBlogCategories,
  deleteBlog,
} from '../controllers/dentalBlogController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middleware/security.js';

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/blogs or GET /api/dental-blogs - Dynamic category filtering (req.query) with Redis cache & Rate limiting
router.get('/categories', apiLimiter, getBlogCategories);
router.get('/', apiLimiter, getAllBlogs);
router.get('/:id', apiLimiter, getBlogById);
router.patch('/:id/like', likeBlog);

// ─── Protected CMS Routes (admin / doctor) ────────────────────────────────────
router.post('/', protect, authorize('super_admin', 'doctor'), createBlog);
router.put('/:id', protect, authorize('super_admin', 'doctor'), updateBlog);
router.patch('/:id/status', protect, authorize('super_admin', 'doctor'), updateBlogStatus);
router.delete('/:id', protect, authorize('super_admin'), deleteBlog);

export default router;

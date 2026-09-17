// backend/routes/authRoutes.js
import express from 'express';
import { registerPatient, login, getMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
// POST /api/auth/register  — create a new patient account
router.post('/register', authLimiter, registerPatient);

// POST /api/auth/login  — login (patient or staff/admin)
router.post('/login', authLimiter, login);

// ── Protected ─────────────────────────────────────────────────────────────────
// GET /api/auth/me  — get own profile
router.get('/me', protect, getMe);

// PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

export default router;

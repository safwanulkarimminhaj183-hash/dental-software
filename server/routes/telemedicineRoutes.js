import express from 'express';
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSessionStatus,
  addChatMessage,
  getAvailableNow,
  deleteSession,
} from '../controllers/telemedicineController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET  /api/telemedicine/available-now — specialists currently online/waiting
// POST /api/telemedicine               — patient books a consultation session
router.get('/available-now', getAvailableNow);
router.post('/', createSession);

// ─── Protected Routes ────────────────────────────────────────────────────────
// GET  /api/telemedicine               — list all sessions (admin / doctor)
router.get('/', protect, authorize('super_admin', 'doctor', 'receptionist'), getAllSessions);

// GET  /api/telemedicine/:id           — single session with full chat history
// PATCH /api/telemedicine/:id/status   — activate / complete / cancel session
// POST /api/telemedicine/:id/messages  — append a chat message
// DELETE /api/telemedicine/:id         — remove session record
router.get('/:id', protect, authorize('super_admin', 'doctor', 'receptionist'), getSessionById);
router.patch('/:id/status', protect, authorize('super_admin', 'doctor'), updateSessionStatus);
router.post('/:id/messages', protect, authorize('super_admin', 'doctor', 'receptionist'), addChatMessage);
router.delete('/:id', protect, authorize('super_admin'), deleteSession);

export default router;

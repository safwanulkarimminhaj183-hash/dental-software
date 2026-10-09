import express from 'express';
import { 
  registerUser, 
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile check route (Testing Protected Route)
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Users/Dentists management routes
router.get('/users', protect, getAllUsers);
router.get('/users/:id', protect, getUserById);
router.put('/users/:id', protect, authorize('super_admin'), updateUser);
router.delete('/users/:id', protect, authorize('super_admin'), deleteUser);

export default router;

import express from 'express';
import mongoose from 'mongoose';
import Branch from '../models/Branch.js';
import Doctor from '../models/Doctor.js';
import { optionalAuth } from '../middleware/auth.js';
import { trackActivity } from '../middleware/activityTracker.js';
import { apiLimiter } from '../middleware/security.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import logger from '../utils/logger.js';

const router = express.Router();

const FALLBACK_BRANCHES = [
  { _id: '1', id: '1', name: 'Downtown Main Clinic', address: '123 Medical Center Blvd', city: 'Austin', phone: '(512) 555-0100', email: 'downtown@dentocare.com' },
  { _id: '2', id: '2', name: 'Northside Branch', address: '8900 Tech Ridge Parkway', city: 'Round Rock', phone: '(512) 555-0102', email: 'north@dentocare.com' },
  { _id: '3', id: '3', name: 'Southpark Family Care', address: '4500 William Cannon Dr', city: 'Austin', phone: '(512) 555-0103', email: 'south@dentocare.com' }
];

const FALLBACK_DOCTORS = {
  '1': [
    { _id: 'doc_101', name: 'Dr. Sarah Johnson', specialty: 'General Dentistry & Cleaning', experience: 12, isAvailable: true, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_102', name: 'Dr. Michael Chen', specialty: 'Orthodontics & Braces', experience: 8, isAvailable: true, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' }
  ],
  '2': [
    { _id: 'doc_201', name: 'Dr. Priya Patel', specialty: 'Pediatric & Family Dentistry', experience: 7, isAvailable: true, image: 'https://images.unsplash.com/photo-1594824813571-24a69f100417?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_202', name: 'Dr. David Kim', specialty: 'Oral Surgery & Implants', experience: 20, isAvailable: true, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300' }
  ],
  '3': [
    { _id: 'doc_301', name: 'Dr. Emily Rodriguez', specialty: 'Cosmetic Dentistry & Veneers', experience: 15, isAvailable: true, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_302', name: 'Dr. James Park', specialty: 'Endodontics & Root Canal', experience: 10, isAvailable: true, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' }
  ]
};

// Helper to get fallback doctors by branch ID or name keyword
const getFallbackDoctorsForBranch = (branchIdOrName) => {
  const str = String(branchIdOrName || '').toLowerCase();
  if (str.includes('2') || str.includes('north')) return FALLBACK_DOCTORS['2'];
  if (str.includes('3') || str.includes('south')) return FALLBACK_DOCTORS['3'];
  return FALLBACK_DOCTORS['1'];
};

// Apply rate limiting to all routes
router.use(apiLimiter);

// GET / - Get all active branches (with caching)
router.get(
  '/',
  optionalAuth,
  trackActivity('view_branch'),
  async (req, res) => {
    try {
      const cacheKey = 'branches:all';

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        logger.info('Branches served from cache');
        return res.json({ success: true, data: cached, total: cached.length, cached: true });
      }

      if (mongoose.connection.readyState === 1) {
        const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
        if (branches && branches.length > 0) {
          await cacheSet(cacheKey, branches, 3600);
          return res.json({ success: true, data: branches, total: branches.length, cached: false });
        }
      }

      // Fallback branches
      return res.json({ success: true, data: FALLBACK_BRANCHES, total: FALLBACK_BRANCHES.length, fallback: true });
    } catch (err) {
      logger.error('Error fetching branches, using fallback:', err);
      return res.json({ success: true, data: FALLBACK_BRANCHES, total: FALLBACK_BRANCHES.length, fallback: true });
    }
  }
);

// GET /:id - Get single branch (with caching)
router.get(
  '/:id',
  optionalAuth,
  trackActivity('view_branch'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `branch:${id}`;

      const cached = await cacheGet(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        const branch = await Branch.findById(id);
        if (branch) {
          await cacheSet(cacheKey, branch, 3600);
          return res.json({ success: true, data: branch, cached: false });
        }
      }

      // Fallback
      const fb = FALLBACK_BRANCHES.find(b => b._id === id || b.id === id) || FALLBACK_BRANCHES[0];
      return res.json({ success: true, data: fb, fallback: true });
    } catch (err) {
      logger.error('Error fetching branch:', err);
      const fb = FALLBACK_BRANCHES[0];
      return res.json({ success: true, data: fb, fallback: true });
    }
  }
);

// POST / - Create a new branch
router.post(
  '/',
  optionalAuth,
  trackActivity('register'),
  async (req, res) => {
    try {
      const { name, address, city, phone, email, openingHours } = req.body;

      if (!name || !address || !city || !phone) {
        return res.status(400).json({ success: false, message: 'Name, address, city, and phone are required.' });
      }

      if (mongoose.connection.readyState === 1) {
        const branch = await Branch.create({ name, address, city, phone, email, openingHours });
        return res.status(201).json({ success: true, message: 'Branch created successfully!', data: branch });
      }

      const newFb = { _id: 'fb_' + Date.now(), name, address, city, phone, email, openingHours };
      FALLBACK_BRANCHES.push(newFb);
      return res.status(201).json({ success: true, message: 'Branch created in memory!', data: newFb });
    } catch (err) {
      logger.error('Error creating branch:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /:id/doctors - Get all doctors in a specific branch
router.get(
  '/:id/doctors',
  optionalAuth,
  trackActivity('view_doctor'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `branch:${id}:doctors`;

      const cached = await cacheGet(cacheKey);
      if (cached && cached.data && cached.data.length > 0) {
        return res.json({ success: true, data: cached.data, total: cached.total, branch: cached.branch, cached: true });
      }

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        const branch = await Branch.findById(id);
        if (branch) {
          const doctors = await Doctor.find({ branch: id }).populate('branch', 'name city').sort({ name: 1 });
          if (doctors && doctors.length > 0) {
            const responseData = {
              data: doctors,
              total: doctors.length,
              branch: { name: branch.name, city: branch.city },
            };
            await cacheSet(cacheKey, responseData, 1800);
            return res.json({ success: true, ...responseData, cached: false });
          }
        }
      }

      // Fallback doctors for this branch
      const docs = getFallbackDoctorsForBranch(id);
      return res.json({
        success: true,
        data: docs,
        total: docs.length,
        branch: { name: 'DentoCare Branch', city: 'Austin' },
        fallback: true
      });
    } catch (err) {
      logger.error('Error fetching doctors, returning fallback:', err);
      const docs = getFallbackDoctorsForBranch(req.params.id);
      return res.json({
        success: true,
        data: docs,
        total: docs.length,
        branch: { name: 'DentoCare Branch', city: 'Austin' },
        fallback: true
      });
    }
  }
);

export default router;

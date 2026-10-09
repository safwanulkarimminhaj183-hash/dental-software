import express from 'express';
import { getClinicAbout, updateClinicAbout } from '../controllers/aboutController.js';

const router = express.Router();

// @route   GET /api/about/clinic
// @desc    Get Clinic details for About Us -> Our Clinic section
router.get('/clinic', getClinicAbout);

// @route   PUT /api/about/clinic
// @desc    Update Clinic details (Admin)
router.put('/clinic', updateClinicAbout);

export default router;

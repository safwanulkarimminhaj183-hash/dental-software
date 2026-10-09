import express from 'express';
import Patient from '../models/Patient.js';
import { optionalAuth } from '../middleware/auth.js';
import { trackActivity } from '../middleware/activityTracker.js';
import { apiLimiter, bookingLimiter } from '../middleware/security.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import logger from '../utils/logger.js';

import mongoose from 'mongoose';

const router = express.Router();

// In-memory patient fallback store when MongoDB is not connected
const inMemoryPatients = [];

// Apply rate limiting to all routes
router.use(apiLimiter);

// POST /register - Register new patient (with validation and activity tracking)
router.post(
  '/register',
  bookingLimiter,
  trackActivity('register'),
  async (req, res) => {
    try {
      const { name, email, phone, medicalHistory, allergies } = req.body;

      if (!name || !email || !phone) {
        logger.warn('Missing required fields for patient registration', { email });
        return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        try {
          const existing = await Patient.findOne({ email: cleanEmail });
          if (existing) {
            return res.status(409).json({ success: false, message: 'Patient with this email already exists. Please login instead.' });
          }

          const patient = await Patient.create({
            name,
            email: cleanEmail,
            phone,
            medicalHistory: medicalHistory || '',
            allergies: allergies || '',
            isNewPatient: true,
          });

          return res.status(201).json({
            success: true,
            message: 'Patient registered successfully!',
            data: patient,
          });
        } catch (dbErr) {
          logger.warn('MongoDB query failed, using in-memory store:', dbErr.message);
        }
      }

      // In-memory fallback
      const existingMem = inMemoryPatients.find(p => p.email === cleanEmail);
      if (existingMem) {
        return res.status(409).json({ success: false, message: 'Patient with this email already exists. Please login instead.' });
      }

      const memPatient = {
        _id: 'mem_' + Date.now(),
        name,
        email: cleanEmail,
        phone,
        medicalHistory: medicalHistory || '',
        allergies: allergies || '',
        isNewPatient: true,
        previousAppointments: []
      };
      inMemoryPatients.push(memPatient);

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully!',
        data: memPatient,
      });
    } catch (err) {
      logger.error('Patient registration error:', err);
      res.status(500).json({ success: false, message: err.message || 'Registration failed' });
    }
  }
);

// POST /login - Simple login by email (with activity tracking)
router.post(
  '/login',
  bookingLimiter,
  trackActivity('login'),
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        logger.warn('Missing email for login');
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        try {
          const patient = await Patient.findOne({ email: cleanEmail }).populate('previousAppointments');
          if (patient) {
            if (patient.isNewPatient) {
              patient.isNewPatient = false;
              await patient.save();
            }
            return res.json({
              success: true,
              message: 'Login successful!',
              data: patient,
            });
          }
        } catch (dbErr) {
          logger.warn('MongoDB query failed, trying in-memory store:', dbErr.message);
        }
      }

      // In-memory fallback
      const memPatient = inMemoryPatients.find(p => p.email === cleanEmail);
      if (memPatient) {
        memPatient.isNewPatient = false;
        return res.json({
          success: true,
          message: 'Login successful!',
          data: memPatient,
        });
      }

      return res.status(404).json({ success: false, message: 'No patient found with this email. Please register first.' });
    } catch (err) {
      logger.error('Patient login error:', err);
      res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  }
);

// GET /:id - Get patient profile (with caching)
router.get(
  '/:id',
  optionalAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `patient:${id}`;

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info('Patient profile served from cache', { patientId: id });
        return res.json({ success: true, data: cached, cached: true });
      }

      // If not in cache, fetch from database
      const patient = await Patient.findById(id).populate('previousAppointments');
      if (!patient) {
        logger.warn('Patient not found', { patientId: id });
        return res.status(404).json({ success: false, message: 'Patient not found.' });
      }

      // Cache for 30 minutes
      await cacheSet(cacheKey, patient, 1800);

      logger.info('Patient profile fetched from database and cached', { patientId: id });
      res.json({ success: true, data: patient, cached: false });
    } catch (err) {
      logger.error('Error fetching patient profile:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET / - Get all patients with optional filter (with caching)
router.get(
  '/',
  optionalAuth,
  async (req, res) => {
    try {
      const { isNew } = req.query;
      const cacheKey = `patients:filter:${isNew || 'all'}`;

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info('Patients served from cache', { filter: isNew });
        return res.json({ success: true, data: cached, total: cached.length, cached: true });
      }

      // If not in cache, fetch from database
      const filter = {};
      if (isNew === 'true') filter.isNewPatient = true;
      if (isNew === 'false') filter.isNewPatient = false;

      const patients = await Patient.find(filter).sort({ createdAt: -1 });

      // Cache for 10 minutes
      await cacheSet(cacheKey, patients, 600);

      logger.info('Patients fetched from database and cached', { count: patients.length, filter: isNew });
      res.json({ success: true, data: patients, total: patients.length, cached: false });
    } catch (err) {
      logger.error('Error fetching patients:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /:id - Update patient profile (with cache invalidation)
router.put(
  '/:id',
  optionalAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await Patient.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!patient) {
        logger.warn('Patient not found for update', { patientId: id });
        return res.status(404).json({ success: false, message: 'Patient not found.' });
      }

      // Clear patient cache
      const { cacheDelete } = await import('../utils/cache.js');
      cacheDelete(`patient:${id}`).catch((err) => logger.error('Error clearing cache:', err));

      // Clear patients list cache
      const { cacheClearPattern } = await import('../utils/cache.js');
      cacheClearPattern('patients:*').catch((err) => logger.error('Error clearing cache pattern:', err));

      logger.info('Patient profile updated successfully', { patientId: id });
      res.json({ success: true, message: 'Patient updated successfully.', data: patient });
    } catch (err) {
      logger.error('Error updating patient profile:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;

import express from 'express';
import Service from '../models/Service.js';
import { optionalAuth } from '../middleware/auth.js';
import { trackActivity } from '../middleware/activityTracker.js';
import { apiLimiter } from '../middleware/security.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// GET /categories - Get distinct list of categories (with caching)
router.get(
  '/categories',
  optionalAuth,
  trackActivity('view_category'),
  async (req, res) => {
    try {
      const cacheKey = 'service:categories';

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info('Categories served from cache');
        return res.json({ success: true, data: cached, cached: true });
      }

      // If not in cache, fetch from database
      const categories = await Service.distinct('category', { isActive: true });

      // Cache for 1 hour
      await cacheSet(cacheKey, categories, 3600);

      logger.info('Categories fetched from database and cached');
      res.json({ success: true, data: categories, cached: false });
    } catch (err) {
      logger.error('Error fetching categories:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET / - Get all services with optional category and search filter (with caching)
router.get(
  '/',
  optionalAuth,
  trackActivity('view_service'),
  async (req, res) => {
    try {
      const { category, search } = req.query;
      const cacheKey = `services:${category || 'all'}:${search || 'none'}`;

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info('Services served from cache', { category, search });
        return res.json({ success: true, data: cached, total: cached.length, cached: true });
      }

      // If not in cache, fetch from database
      const filter = { isActive: true };

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      const services = await Service.find(filter).sort({ category: 1, name: 1 });

      // Cache for 30 minutes
      await cacheSet(cacheKey, services, 1800);

      logger.info('Services fetched from database and cached', { category, search, count: services.length });
      res.json({
        success: true,
        data: services,
        total: services.length,
        cached: false,
      });
    } catch (err) {
      logger.error('Error fetching services:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /:id - Get single service by ID (with caching and view tracking)
router.get(
  '/:id',
  optionalAuth,
  trackActivity('view_service'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `service:${id}`;

      // Try to get from cache first
      const cached = await cacheGet(cacheKey);
      if (cached) {
        logger.info('Service served from cache', { serviceId: id });
        return res.json({ success: true, data: cached, cached: true });
      }

      // If not in cache, fetch from database
      const service = await Service.findById(id);
      if (!service) {
        logger.warn('Service not found', { serviceId: id });
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }

      // Increment view count asynchronously
      service.viewCount = (service.viewCount || 0) + 1;
      service.save().catch((err) => logger.error('Error updating view count:', err));

      // Cache for 1 hour
      await cacheSet(cacheKey, service, 3600);

      logger.info('Service fetched from database and cached', { serviceId: id, name: service.name });
      res.json({ success: true, data: service, cached: false });
    } catch (err) {
      logger.error('Error fetching service:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
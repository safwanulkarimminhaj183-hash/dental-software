import express from 'express';
import { getHome1Hero, getHome2Features } from '../controllers/homeController.js';

const router = express.Router();

// GET /api/home1/hero
router.get('/home1/hero', getHome1Hero);

// GET /api/home2/features
router.get('/home2/features', getHome2Features);

export default router;

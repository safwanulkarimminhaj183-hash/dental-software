const express = require('express');
const router = express.Router();
const { getGalleryCases, createCase, approveCase, deleteCase } = require('../controllers/galleryController');
const { upload, processAndSaveImages } = require('../middleware/upload');

// Public Route: Triggered when user opens "About Us -> Smile Gallery"
router.get('/', getGalleryCases);

// Admin/Staff Routes: Upload case with image processing middleware
router.post('/upload', upload.single('image'), processAndSaveImages, createCase);

// Lead Doctor Approval Route
router.patch('/:id/approve', approveCase);

// Delete Route
router.delete('/:id', deleteCase);

module.exports = router;
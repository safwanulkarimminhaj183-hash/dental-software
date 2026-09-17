// backend/middlewares/uploadMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Multer In-Memory Storage Middleware for Dental Photography Uploads
// ─────────────────────────────────────────────────────────────────────────────
import multer from 'multer';

// Allowed dental photo MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/tiff',
]);

// Use memory storage so raw buffers are processed by Sharp before hitting disk
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype}). Only JPG, PNG, WEBP, HEIC, and TIFF images are accepted.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB per image (high-res clinical camera photos)
    files: 2, // 1 before + 1 after
  },
  fileFilter,
});

/**
 * Middleware handling multipart uploads for smile gallery cases:
 * expects 'beforeImage' (optional for updates, required for creation) and 'afterImage'.
 */
export const uploadCaseImages = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed limit of 15MB per image.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

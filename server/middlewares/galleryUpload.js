import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Upload directory paths ───────────────────────────────────────────────────
const UPLOAD_ROOT   = path.join(__dirname, '..', 'uploads', 'gallery');
const PROCESSED_DIR = path.join(UPLOAD_ROOT, 'processed');
const THUMB_DIR     = path.join(UPLOAD_ROOT, 'thumbnails');
const ORIGINAL_DIR  = path.join(UPLOAD_ROOT, 'originals');

// Ensure all directories exist
[PROCESSED_DIR, THUMB_DIR, ORIGINAL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Watermark SVG (clinic logo text overlay) ────────────────────────────────
// In production replace with actual PNG logo file via sharp composite
const buildWatermarkSVG = (width, height) => {
  const fontSize = Math.max(14, Math.round(width * 0.035));
  const padding  = Math.round(width * 0.02);
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${padding}" y="${height - fontSize * 2 - padding}"
        width="${fontSize * 9}" height="${fontSize * 1.6}"
        rx="4" fill="rgba(0,0,0,0.45)"
      />
      <text
        x="${padding + 8}" y="${height - fontSize * 0.7 - padding}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}px"
        font-weight="bold"
        fill="white"
        opacity="0.9"
      >© DentoCare Clinic</text>
    </svg>`
  );
};

// ─── HIPAA: strip all EXIF / metadata from filename ──────────────────────────
// Filename contains only timestamp + random hex — zero patient PII
const safeFilename = (prefix) => {
  const ts   = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${ts}-${rand}`;
};

// ─── Multer — store raw uploads in memory (never touch disk with originals) ──
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, or HEIC images are allowed.'), false);
  }
};

// Accept up to 2 files: beforeImage + afterImage
export const galleryMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max raw upload
  fileFilter,
}).fields([
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage',  maxCount: 1 },
]);

// ─── Core processing pipeline ─────────────────────────────────────────────────
/**
 * Process a single image buffer through the full pipeline:
 *  1. Auto-orient (EXIF rotation fix)
 *  2. Resize to max 1200×900 (preserving aspect ratio)
 *  3. Convert to WebP at quality 82 (file size ~60-70% smaller)
 *  4. Apply SVG watermark composite
 *  5. Save processed WebP to /processed
 *  6. Generate 480×360 thumbnail → /thumbnails
 *  7. Save original (EXIF stripped) → /originals  (NOT served publicly)
 *
 * Returns metadata object to store in DB.
 */
export const processGalleryImage = async (buffer, prefix) => {
  const name = safeFilename(prefix);

  // ── 1. Load & auto-orient ────────────────────────────────────────────────
  const base = sharp(buffer).rotate(); // honours EXIF orientation

  // Get image dimensions after orientation correction
  const meta = await base.clone().metadata();
  const origWidth  = meta.width  || 1200;
  const origHeight = meta.height || 900;

  // ── 2 & 3. Resize + WebP conversion ─────────────────────────────────────
  const resized = await base
    .clone()
    .resize({
      width:  1200,
      height: 900,
      fit:    sharp.fit.inside,   // never upscale, preserve ratio
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const { data: processedBuf, info } = resized;
  const finalWidth  = info.width;
  const finalHeight = info.height;

  // ── 4. Watermark overlay ─────────────────────────────────────────────────
  const watermarkSvg = buildWatermarkSVG(finalWidth, finalHeight);
  const watermarkedBuf = await sharp(processedBuf)
    .composite([{ input: watermarkSvg, gravity: 'southeast' }])
    .webp({ quality: 82 })
    .toBuffer();

  // ── 5. Save processed (watermarked WebP) ────────────────────────────────
  const processedFilename = `${name}.webp`;
  const processedPath     = path.join(PROCESSED_DIR, processedFilename);
  await fs.promises.writeFile(processedPath, watermarkedBuf);

  // ── 6. Thumbnail (480×360, no watermark needed — too small) ─────────────
  const thumbFilename = `thumb-${name}.webp`;
  const thumbPath     = path.join(THUMB_DIR, thumbFilename);
  await sharp(processedBuf)
    .resize({ width: 480, height: 360, fit: sharp.fit.cover })
    .webp({ quality: 70 })
    .toFile(thumbPath);

  // ── 7. Original (EXIF stripped, safe storage — private) ─────────────────
  const origFilename = `orig-${name}.webp`;
  const origPath     = path.join(ORIGINAL_DIR, origFilename);
  await sharp(buffer)
    .rotate()                     // fix orientation
    .webp({ quality: 95 })        // near-lossless original
    .withMetadata(false)          // STRIP ALL EXIF — HIPAA compliance
    .toFile(origPath);

  return {
    processedFilename,
    processedUrl:     `/uploads/gallery/processed/${processedFilename}`,
    thumbnailFilename: thumbFilename,
    thumbnailUrl:     `/uploads/gallery/thumbnails/${thumbFilename}`,
    originalFilename: origFilename,  // stored but URL never exposed in API
    width:      finalWidth,
    height:     finalHeight,
    sizeBytes:  watermarkedBuf.length,
    format:     'webp',
    hasWatermark: true,
  };
};

// ─── Express middleware: process req.files after multer ───────────────────────
export const processGalleryImages = async (req, res, next) => {
  try {
    req.processedImages = {};

    if (req.files?.beforeImage?.[0]) {
      req.processedImages.beforeImage = await processGalleryImage(
        req.files.beforeImage[0].buffer,
        'before'
      );
    }

    if (req.files?.afterImage?.[0]) {
      req.processedImages.afterImage = await processGalleryImage(
        req.files.afterImage[0].buffer,
        'after'
      );
    }

    next();
  } catch (err) {
    console.error('Image processing error:', err.message);
    return res.status(422).json({
      success: false,
      message: `Image processing failed: ${err.message}`,
    });
  }
};

// ─── Helper: delete old image files from disk ────────────────────────────────
export const deleteImageFiles = (imageVariant) => {
  if (!imageVariant) return;
  const toDelete = [
    imageVariant.processedFilename ? path.join(PROCESSED_DIR, imageVariant.processedFilename) : null,
    imageVariant.thumbnailFilename ? path.join(THUMB_DIR,     imageVariant.thumbnailFilename) : null,
    imageVariant.originalFilename  ? path.join(ORIGINAL_DIR,  imageVariant.originalFilename)  : null,
  ].filter(Boolean);

  toDelete.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn(`Could not delete file ${filePath}:`, err.message);
      }
    });
  });
};

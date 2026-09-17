// backend/services/imageProcessingService.js
// ─────────────────────────────────────────────────────────────────────────────
// Module 1: Image Upload & Processing Pipeline + HIPAA De-identification
// ─────────────────────────────────────────────────────────────────────────────
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard upload storage directory
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/gallery');

// Image sizing configurations for gallery grid, card display, and high-res zoom
export const IMAGE_VARIANTS = {
  thumbnail: { width: 400, height: 300, fit: 'cover', quality: 80 },
  display:   { width: 800, height: 600, fit: 'cover', quality: 82 },
  full:      { width: 1200, height: 900, fit: 'inside', quality: 85 },
};

/**
 * Generate an SVG watermark badge.
 * Features clinic branding, copyright notice, and semi-transparent badge.
 */
const createWatermarkSvg = (clinicName = 'Smile Care Dental Clinic') => {
  const badgeWidth = 260;
  const badgeHeight = 44;

  const svg = `
    <svg width="${badgeWidth}" height="${badgeHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <!-- Rounded frosted backdrop badge -->
      <rect width="${badgeWidth - 4}" height="${badgeHeight - 4}" x="2" y="2" rx="6" ry="6" 
            fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1" />
      
      <!-- Clinic Brand Text -->
      <text x="${badgeWidth / 2}" y="18" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="12px" font-weight="700" fill="#ffffff" text-anchor="middle"
            filter="url(#shadow)">
        🦷 ${clinicName}
      </text>
      
      <!-- Copyright & Protection Note -->
      <text x="${badgeWidth / 2}" y="32" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="9px" font-weight="400" fill="rgba(241, 245, 249, 0.9)" text-anchor="middle">
        Verified Case • Protected Dental Photography
      </text>
    </svg>
  `;
  return Buffer.from(svg);
};

/**
 * Process an in-memory image buffer:
 *  1. HIPAA Compliance: Strips all EXIF, GPS, camera serial, and personal metadata.
 *  2. Modern WebP Encoding: Optimizes compression ratio while maintaining medical grade fidelity.
 *  3. Multi-resolution generation: thumbnail (400x300), display (800x600), full (1200x900).
 *  4. Watermarking: Applies clinic logo/text composite on display and full variants.
 *  5. Secure Naming: Cryptographically random hex names (prevents patient identity leaks).
 *
 * @param {Buffer} buffer - Raw file buffer from Multer memory storage
 * @param {string} prefix - 'before' or 'after'
 * @returns {Promise<Object>} Variant URLs and metadata
 */
export const processDentalImage = async (buffer, prefix = 'case') => {
  // Ensure target folder exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Generate cryptographically random token (HIPAA: No patient names or dates in filenames)
  const randomHash = crypto.randomBytes(12).toString('hex');
  const timestamp = Date.now();
  const baseFilename = `${prefix}_${randomHash}_${timestamp}`;

  const results = {};
  const watermarkBadge = createWatermarkSvg('Smile Care Dental Clinic');

  for (const [variant, config] of Object.entries(IMAGE_VARIANTS)) {
    const filename = `${baseFilename}_${variant}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    // Step 1: Resize and rotate (rotate strips EXIF orientation tags)
    let pipeline = sharp(buffer)
      .rotate()
      .resize({
        width: config.width,
        height: config.height,
        fit: config.fit,
        position: sharp.strategy.attention, // Focus on primary dental subject
        withoutEnlargement: variant === 'full',
      });

    // Step 2: Apply watermark on display and full view variants
    if (variant === 'display' || variant === 'full') {
      pipeline = pipeline.composite([
        {
          input: watermarkBadge,
          gravity: 'southeast',
          top: undefined,
          left: undefined,
        },
      ]);
    }

    // Step 3: Convert to WebP with controlled quality (Sharp strips all EXIF/IPTC by default)
    const processedBuffer = await pipeline
      .webp({ quality: config.quality, effort: 4 })
      .toBuffer();

    // Step 4: Write optimized file to disk
    await fs.writeFile(outputPath, processedBuffer);

    // Read metadata of the final compressed image
    const finalMeta = await sharp(processedBuffer).metadata();

    results[variant] = {
      filename,
      url: `/uploads/gallery/${filename}`,
      width: finalMeta.width,
      height: finalMeta.height,
      sizeBytes: processedBuffer.length,
      format: 'webp',
    };
  }

  return {
    thumbnail: results.thumbnail.url,
    display: results.display.url,
    full: results.full.url,
    dimensions: {
      width: results.display.width,
      height: results.display.height,
    },
    optimizedSizes: {
      thumbBytes: results.thumbnail.sizeBytes,
      displayBytes: results.display.sizeBytes,
      fullBytes: results.full.sizeBytes,
    },
  };
};

/**
 * Remove image files associated with a case when deleted or updated.
 *
 * @param {Object} imageObj - Case image object containing { thumbnail, display, full }
 */
export const deleteCaseImages = async (imageObj) => {
  if (!imageObj) return;

  const urls = [imageObj.thumbnail, imageObj.display, imageObj.full].filter(Boolean);

  for (const url of urls) {
    try {
      const filename = path.basename(url);
      const filePath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file was already removed
      if (err.code !== 'ENOENT') {
        console.warn(`[ImageService] Error deleting file ${url}:`, err.message);
      }
    }
  }
};

/**
 * Seed script: Populates the SmileCase collection with clinical smile gallery demo cases.
 * 
 * Usage (from project root):
 *   node server/seedGallery.js
 * 
 * Usage (from server/ directory):
 *   node seedGallery.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import SmileCase from './models/gallery/SmileCase.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dentist-db';

const sampleCases = [
  {
    caseId: 'SC-102938',
    title: 'Full Arch Dental Implant Reconstruction',
    description: 'Patient presented with severe tooth loss and bone resorption in the upper jaw. Comprehensive 3D guided implant placement with monolithic zirconia bridge delivered optimal aesthetic and masticatory function.',
    category: 'Dental Implants',
    doctorName: 'Dr. Adrian Thorne, DDS',
    patientAge: 52,
    patientGender: 'Male',
    treatmentDuration: '4 Months',
    procedureDetails: 'CBCT 3D Guided Implant Surgery, 6 All-on-4 Titanium Implants, Fixed Zirconia Bridge.',
    tags: ['Implants', 'Full Arch', 'Zirconia', 'All-on-4'],
    isBefore_After: true,
    beforeImage: {
      processedFilename: 'before-implants-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-before-implants.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    afterImage: {
      processedFilename: 'after-implants-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-after-implants.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    status: 'approved',
    uploadedBy: 'Dr. Adrian Thorne',
    uploadedByRole: 'doctor',
    approvedBy: 'Dr. Adrian Thorne',
    approvedAt: new Date(),
    isFeatured: true,
    displayOrder: 1,
    viewCount: 428,
  },
  {
    caseId: 'SC-203941',
    title: 'Laser Teeth Whitening & Enamel Remineralization',
    description: 'Severe tetracycline staining and coffee discoloration resolved using dual-wave blue laser light whitening followed by nano-hydroxyapatite enamel therapy.',
    category: 'Teeth Whitening',
    doctorName: 'Dr. Maya Lin, DMD',
    patientAge: 29,
    patientGender: 'Female',
    treatmentDuration: '2 Sessions (60 mins each)',
    procedureDetails: 'Zoom Laser In-Office Whitening 38% Hydrogen Peroxide with Desensitizing Protection.',
    tags: ['Whitening', 'Laser Care', 'Cosmetic', 'Bright Smile'],
    isBefore_After: true,
    beforeImage: {
      processedFilename: 'before-whitening-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-before-whitening.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    afterImage: {
      processedFilename: 'after-whitening-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-after-whitening.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    status: 'approved',
    uploadedBy: 'Dr. Maya Lin',
    uploadedByRole: 'doctor',
    approvedBy: 'Dr. Adrian Thorne',
    approvedAt: new Date(),
    isFeatured: true,
    displayOrder: 2,
    viewCount: 612,
  },
  {
    caseId: 'SC-304952',
    title: 'Custom E-Max Porcelain Veneers (Upper 8 Teeth)',
    description: 'Patient requested correction for chipped central incisors, diastema (midline gap), and uneven gumline. Handcrafted ultra-thin E-Max veneers crafted with natural translucency.',
    category: 'Veneers',
    doctorName: 'Dr. Marcus Vance, DDS',
    patientAge: 34,
    patientGender: 'Female',
    treatmentDuration: '3 Weeks',
    procedureDetails: 'Digital Smile Design (DSD), Minimal Prep Veneers 0.3mm, Gingival Contouring.',
    tags: ['Veneers', 'E-Max', 'Porcelain', 'Smile Design'],
    isBefore_After: true,
    beforeImage: {
      processedFilename: 'before-veneers-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-before-veneers.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    afterImage: {
      processedFilename: 'after-veneers-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-after-veneers.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    status: 'approved',
    uploadedBy: 'Dr. Marcus Vance',
    uploadedByRole: 'doctor',
    approvedBy: 'Dr. Adrian Thorne',
    approvedAt: new Date(),
    isFeatured: true,
    displayOrder: 3,
    viewCount: 389,
  },
  {
    caseId: 'SC-405963',
    title: 'Adult Orthodontics: Complex Malocclusion & Overbite Fix',
    description: 'Class II Division 1 malocclusion with severe crowding treated using clear ceramic bracket system and precision biomechanics without extractions.',
    category: 'Braces',
    doctorName: 'Dr. Adrian Thorne, DDS',
    patientAge: 24,
    patientGender: 'Male',
    treatmentDuration: '14 Months',
    procedureDetails: 'Clear Aesthetic Ceramic Braces, NiTi Archwires, Interproximal Enamel Reduction.',
    tags: ['Braces', 'Orthodontics', 'Overbite', 'Alignment'],
    isBefore_After: true,
    beforeImage: {
      processedFilename: 'before-braces-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-before-braces.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    afterImage: {
      processedFilename: 'after-braces-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-after-braces.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    status: 'approved',
    uploadedBy: 'Dr. Adrian Thorne',
    uploadedByRole: 'doctor',
    approvedBy: 'Dr. Adrian Thorne',
    approvedAt: new Date(),
    isFeatured: false,
    displayOrder: 4,
    viewCount: 295,
  },
  {
    caseId: 'SC-506974',
    title: 'Complete Cosmetic Smile Makeover & Gum Architecture',
    description: 'Combined laser gingivectomy with porcelain bonded crowns and shade B1 ceramic restorations to achieve an aesthetically harmonic Hollywood smile.',
    category: 'Smile Makeover',
    doctorName: 'Dr. Sarah Jenkins, DDS',
    patientAge: 38,
    patientGender: 'Female',
    treatmentDuration: '6 Weeks',
    procedureDetails: 'Laser Gum Recontouring, 10 Monolithic Zirconia Crowns, Functional Bite Adjustment.',
    tags: ['Smile Makeover', 'Laser Gum Lift', 'Zirconia Crowns'],
    isBefore_After: true,
    beforeImage: {
      processedFilename: 'before-makeover-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-before-makeover.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    afterImage: {
      processedFilename: 'after-makeover-demo.webp',
      processedUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop',
      thumbnailFilename: 'thumb-after-makeover.webp',
      thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=480&auto=format&fit=crop',
      width: 1200,
      height: 900,
      format: 'webp',
      hasWatermark: true,
    },
    status: 'approved',
    uploadedBy: 'Dr. Sarah Jenkins',
    uploadedByRole: 'doctor',
    approvedBy: 'Dr. Adrian Thorne',
    approvedAt: new Date(),
    isFeatured: true,
    displayOrder: 5,
    viewCount: 520,
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await SmileCase.deleteMany({});
    console.log('🗑️ Cleared existing SmileCase records');

    const inserted = await SmileCase.insertMany(sampleCases);
    console.log(`🎉 Successfully seeded ${inserted.length} Smile Gallery cases!`);

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding gallery cases:', err);
    process.exit(1);
  }
}

seed();

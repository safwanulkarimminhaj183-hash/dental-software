/**
 * Seed script: Populates Services and PromoCodes collections
 *
 * Usage (from project root):
 *   node server/seedServices.js
 *
 * Usage (from server/ directory):
 *   node seedServices.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import Service from './models/Service.js';
import PromoCode from './models/PromoCode.js';
import Specialist from './models/Specialist.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dentist-db';

const sampleServices = [
  {
    serviceId: 105,
    slug: 'root-canal',
    name: 'Root Canal Therapy',
    category: 'Endodontics',
    shortDescription: 'Gentle, pain-relieving endodontic therapy with advanced micro-rotary files and 3D apex locator.',
    fullDescription: 'Root canal therapy is a highly effective treatment designed to eliminate bacteria from an infected root canal, prevent reinfection, and save the natural tooth. Our clinic utilizes advanced digital imaging and gentle local anaesthesia to ensure a virtually pain-free experience.',
    basePrice: 450,
    currency: 'USD',
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
    assignedDentistName: 'Dr. Maya Lin, DMD',
    assignedDentistRole: 'Senior Endodontist & Micro-Root Specialist',
    highlights: [
      'Digital 3D CBCT imaging for ultra-precise canal mapping',
      'Microscope-assisted root disinfection for 98.4% success rate',
      'Same-day bio-compatible core buildup and temporary protection',
      'Minimally invasive, virtually zero-pain anaesthetic protocol',
    ],
    procedureSteps: [
      { stepNumber: 1, title: 'Digital X-Ray & Canal Mapping', description: 'High-resolution CBCT scan to pinpoint infection depth.' },
      { stepNumber: 2, title: 'Gentle Disinfection & Cleaning', description: 'Rotary nickel-titanium instruments eliminate bacteria and infected pulp.' },
      { stepNumber: 3, title: 'Biocompatible Sealing', description: 'Gutta-percha thermocured sealing protects against future reinfection.' },
      { stepNumber: 4, title: 'Crown / Restoration Prep', description: 'Structural core buildup prepared for durable natural tooth preservation.' },
    ],
    preparationTips: [
      'Take prescribed premedication if instructed by the specialist.',
      'Eat a light meal 1 hour prior to your visit.',
      'Avoid caffeinated beverages 2 hours before procedure.',
    ],
    serviceDiscountPercent: 15,
    serviceDiscountReason: 'Online Booking Promotional Rate',
    isActive: true,
  },
  {
    serviceId: 101,
    slug: 'smile-enhancement',
    name: 'Smile Enhancement & Cosmetic Dentistry',
    category: 'Cosmetic Dentistry',
    shortDescription: 'Comprehensive cosmetic smile design incorporating porcelain veneers, reshaping, and shade matching.',
    fullDescription: 'Customized aesthetic smile design designed to correct chips, gaps, discolouration, and symmetry. We combine 3D facial aesthetic scanning with ultra-thin porcelain veneers.',
    basePrice: 650,
    currency: 'USD',
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop',
    assignedDentistName: 'Dr. Elena Rossi, DDS',
    assignedDentistRole: 'Lead Cosmetic & Smile Design Specialist',
    highlights: [
      '3D Digital Smile Simulation before any procedure begins',
      'Ultra-thin 0.3mm E-Max porcelain veneers',
      'Customized shade matching under clinical daylight spectrum',
    ],
    procedureSteps: [
      { stepNumber: 1, title: 'Facial Aesthetic Digital Scan', description: 'Capture digital smile harmonics and bite mechanics.' },
      { stepNumber: 2, title: 'Mock-up Smile Preview', description: 'Test and preview your customized smile in 3D.' },
      { stepNumber: 3, title: 'Precision Bonding', description: 'Handcrafted ceramic restorations bonded with dental laser light.' },
    ],
    preparationTips: ['Bring reference photos if you have specific aesthetic preferences.'],
    serviceDiscountPercent: 10,
    serviceDiscountReason: 'Cosmetic Consultation Promo',
    isActive: true,
  },
  {
    serviceId: 102,
    slug: 'pediatric-care',
    name: 'Pediatric Dental Care',
    category: 'Pediatric Dentistry',
    shortDescription: 'Gentle, friendly, and fear-free dental care tailored specifically for infants, children, and teens.',
    fullDescription: 'Our pediatric dental department provides preventive cleanings, fluoride varnish, cavity treatments, and gentle orthodontic evaluations in a welcoming, stress-free setting.',
    basePrice: 180,
    currency: 'USD',
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
    assignedDentistName: 'Dr. Sarah Jenkins, DDS',
    assignedDentistRole: 'Board-Certified Pediatric Dental Specialist',
    highlights: [
      'Child-friendly treatment rooms with interactive entertainment',
      'Fluoride enamel mineralization and sealant protection',
      'Preventive habits coaching for lifelong oral health',
    ],
    procedureSteps: [
      { stepNumber: 1, title: 'Gentle Visual Exam', description: 'Interactive checkup designed to build trust and comfort.' },
      { stepNumber: 2, title: 'Plaque Cleaning & Polishing', description: 'Soft rubber cup polishing with tasty bubblegum/mint pastes.' },
      { stepNumber: 3, title: 'Protective Fluoride Shield', description: 'Fast-drying varnish application for cavity immunity.' },
    ],
    preparationTips: ['Prepare your child with positive stories; avoid using words like "needle" or "drill".'],
    serviceDiscountPercent: 0,
    isActive: true,
  },
  {
    serviceId: 103,
    slug: 'dental-implants',
    name: 'Permanent Dental Implants',
    category: 'Implantology',
    shortDescription: 'State-of-the-art titanium and zirconia implant restorations offering lifetime tooth replacement.',
    fullDescription: 'Permanent, bone-fused implants designed to mimic real tooth roots with unparalleled strength, chew efficiency, and lifelike aesthetics.',
    basePrice: 1200,
    currency: 'USD',
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
    assignedDentistName: 'Dr. Marcus Vance, DDS',
    assignedDentistRole: 'Prosthodontist & Oral Implantologist',
    highlights: [
      'Grade 4 medical titanium implants with osteo-conductive coating',
      'CBCT 3D surgical guide ensuring 0.1mm surgical precision',
      'Lifetime manufacturer warranty on implant posts',
    ],
    procedureSteps: [
      { stepNumber: 1, title: '3D Bone Density Assessment', description: 'Digital scan to determine optimal fixture trajectory.' },
      { stepNumber: 2, title: 'Implant Post Placement', description: 'Micro-surgical placement with rapid recovery protocol.' },
      { stepNumber: 3, title: 'Custom Zirconia Crown Fixture', description: 'Precision abutment and custom porcelain crown attachment.' },
    ],
    preparationTips: ['Fast for 6 hours if twilight IV sedation is selected.'],
    serviceDiscountPercent: 12,
    serviceDiscountReason: 'Implant Package Promotion',
    isActive: true,
  },
  {
    serviceId: 104,
    slug: 'laser-teeth-whitening',
    name: 'Laser Teeth Whitening',
    category: 'Cosmetic Dentistry',
    shortDescription: 'Advanced dual-wavelength laser whitening delivering up to 8 shades lighter in a single 60-minute session.',
    fullDescription: 'Medical-grade in-office laser whitening that breaks down deep enamel stains from tea, coffee, wine, and ageing without causing thermal sensitivity.',
    basePrice: 280,
    currency: 'USD',
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=800&auto=format&fit=crop',
    assignedDentistName: 'Dr. Adrian Thorne, DDS',
    assignedDentistRole: 'Senior Dental Practitioner',
    highlights: [
      'Up to 8 shades whiter in 1 appointment',
      'Desensitizing blue LED protection for zero sensitivity',
      'Complimentary take-home touchup gel tray included',
    ],
    procedureSteps: [
      { stepNumber: 1, title: 'Gingival Barrier Protection', description: 'Isolate and protect sensitive gum margins.' },
      { stepNumber: 2, title: 'Laser Gel Activation', description: 'Apply 38% HP gel and expose to photothermal laser light.' },
      { stepNumber: 3, title: 'Remineralizing Gloss Polish', description: 'Apply nano-hydroxyapatite seal to lock in brilliance.' },
    ],
    preparationTips: ['Avoid dark staining food and drinks for 24 hours after treatment.'],
    serviceDiscountPercent: 20,
    serviceDiscountReason: 'First-time Patient Special',
    isActive: true,
  }
];

const samplePromos = [
  {
    code: 'WELCOME10',
    description: '10% Welcome Discount for New Visitors',
    discountType: 'percentage',
    discountValue: 10,
    targetUserType: 'guest',
    applicableServiceIds: [],
    isActive: true,
  },
  {
    code: 'ROOTCANAL15',
    description: '15% Endodontic Relief Special',
    discountType: 'percentage',
    discountValue: 15,
    targetUserType: 'all',
    applicableServiceIds: [105],
    isActive: true,
  },
  {
    code: 'SMILE50',
    description: '$50 Off Implants & Cosmetic Packages',
    discountType: 'fixed',
    discountValue: 50,
    targetUserType: 'all',
    applicableServiceIds: [101, 103],
    isActive: true,
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Link specialists if present in database
    const allSpecialists = await Specialist.find();
    for (const s of sampleServices) {
      const match = allSpecialists.find(
        (sp) => sp.specialization?.toLowerCase().includes(s.category.toLowerCase().split(' ')[0]) ||
                sp.name.toLowerCase().includes(s.assignedDentistName.split(' ')[1]?.toLowerCase() || '')
      );
      if (match) {
        s.assignedSpecialistId = match._id;
      }
    }

    await Service.deleteMany({});
    console.log('🗑️ Cleared existing Service records');

    const insertedServices = await Service.insertMany(sampleServices);
    console.log(`🎉 Seeded ${insertedServices.length} Dental Services (including serviceId: 105 Root Canal)!`);

    await PromoCode.deleteMany({});
    console.log('🗑️ Cleared existing PromoCode records');

    const insertedPromos = await PromoCode.insertMany(samplePromos);
    console.log(`🎉 Seeded ${insertedPromos.length} Promo Codes!`);

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding services:', err);
    process.exit(1);
  }
}

seed();

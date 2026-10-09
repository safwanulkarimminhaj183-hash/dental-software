import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TreatmentPlan from './models/TreatmentPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const samplePlans = [
  {
    title: 'Advanced Clear Aligners & Orthodontic Realignment',
    category: 'Orthodontics',
    description: 'Custom-designed invisible teeth aligners for discreet, comfortable orthodontic correction of crowded, crooked, or spaced teeth.',
    targetAgeMin: 12,
    targetAgeMax: 60,
    price: 1850,
    originalPrice: 2200,
    discountPercentage: 15,
    tax: 50,
    insuranceCovered: 400,
    duration: '4-8 months',
    treatmentSteps: [
      { stepNo: 1, title: '3D Intraoral Scan & X-Ray Diagnostics', description: 'Digital impression mapping with 3D model simulation', estimatedDuration: '1 Visit', status: 'Pending' },
      { stepNo: 2, title: 'Custom Aligner Fabrication', description: 'Precision clear tray set manufactured according to treatment blueprint', estimatedDuration: '2 Weeks', status: 'Pending' },
      { stepNo: 3, title: 'Progress Monitoring & Tray Switches', description: 'Bi-weekly alignment evaluation and tray updates', estimatedDuration: '6 Visits', status: 'Pending' },
      { stepNo: 4, title: 'Final Retention & Teeth Polishing', description: 'Nighttime retainer fitting and smile polish', estimatedDuration: '1 Visit', status: 'Pending' }
    ],
    suitableForConditions: ['Crooked Teeth', 'Misaligned Teeth', 'Spacing & Gaps', 'Overbite', 'Underbite'],
    clicks: 142,
    bookingsCount: 28,
    totalRevenue: 51800,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Titanium Dental Implant & Porcelain Crown Restoration',
    category: 'Implants',
    description: 'Permanent, natural-looking tooth replacement utilizing surgical-grade titanium posts and hand-crafted ceramic crowns.',
    targetAgeMin: 18,
    targetAgeMax: 80,
    price: 2400,
    originalPrice: 2800,
    discountPercentage: 14,
    tax: 75,
    insuranceCovered: 500,
    duration: '3-6 months',
    treatmentSteps: [
      { stepNo: 1, title: 'CBCT 3D Bone Scan & Surgical Planning', description: 'Evaluation of jawbone density and nerve topography', estimatedDuration: '1 Visit', status: 'Pending' },
      { stepNo: 2, title: 'Implant Post Surgical Placement', description: 'Minimally invasive titanium fixture insertion under local anesthesia', estimatedDuration: '1 Visit', status: 'Pending' },
      { stepNo: 3, title: 'Osseointegration Healing & Abutment', description: 'Bone integration phase and tissue healing collar placement', estimatedDuration: '8-12 Weeks', status: 'Pending' },
      { stepNo: 4, title: 'Zirconia Crown Attachment', description: 'Final shade-matched crown custom cemented for permanent bite function', estimatedDuration: '1 Visit', status: 'Pending' }
    ],
    suitableForConditions: ['Missing Tooth', 'Damaged Root', 'Broken Tooth', 'Jaw Bone Recession'],
    clicks: 98,
    bookingsCount: 19,
    totalRevenue: 45600,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Comprehensive Deep Cleaning & Ultrasonic Scaling',
    category: 'Cleaning',
    description: 'Thorough removal of stubborn calculus, dental plaque, surface stains, and periodontal bacteria using state-of-the-art ultrasonic equipment.',
    targetAgeMin: 6,
    targetAgeMax: 90,
    price: 250,
    originalPrice: 320,
    discountPercentage: 20,
    tax: 15,
    insuranceCovered: 150,
    duration: '1 Visit',
    treatmentSteps: [
      { stepNo: 1, title: 'Periodontal Examination & Pocket Charting', description: 'Measuring gum depth and inflammation index', estimatedDuration: '15 Mins', status: 'Pending' },
      { stepNo: 2, title: 'Ultrasonic Debridement & Tartar Removal', description: 'Vibrational plaque removal above and below gumline', estimatedDuration: '30 Mins', status: 'Pending' },
      { stepNo: 3, title: 'Prophylaxis Air Polishing', description: 'Removal of coffee, tea, and tobacco stains', estimatedDuration: '15 Mins', status: 'Pending' },
      { stepNo: 4, title: 'Fluoride Remineralization Shield', description: 'Enamel strengthening fluoride gel application', estimatedDuration: '5 Mins', status: 'Pending' }
    ],
    suitableForConditions: ['Plaque', 'Tartar Accumulation', 'Stained Teeth', 'Bad Breath', 'Bleeding Gums'],
    clicks: 215,
    bookingsCount: 65,
    totalRevenue: 16250,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Laser-Assisted Painless Root Canal & Crown Therapy',
    category: 'Root Canal',
    description: 'Microscopic Endodontic treatment designed to save infected teeth, eliminate nerve pain, and seal canals using laser sterilization.',
    targetAgeMin: 14,
    targetAgeMax: 75,
    price: 850,
    originalPrice: 1050,
    discountPercentage: 19,
    tax: 30,
    insuranceCovered: 350,
    duration: '1-2 Visits',
    treatmentSteps: [
      { stepNo: 1, title: 'Painless Local Anesthesia & Isolation', description: 'Targeted nerve block for zero-pain procedure', estimatedDuration: '15 Mins', status: 'Pending' },
      { stepNo: 2, title: 'Laser Pulp Extirpation & Canal Cleaning', description: 'Removal of infected nerve tissue and laser disinfection', estimatedDuration: '45 Mins', status: 'Pending' },
      { stepNo: 3, title: 'Gutta-Percha Canal Biosealing', description: 'Thermafil canal filling preventing recurrent infection', estimatedDuration: '30 Mins', status: 'Pending' },
      { stepNo: 4, title: 'Core Build-up & Protective Crown', description: 'Structural reinforcement and protective crown placing', estimatedDuration: '1 Visit', status: 'Pending' }
    ],
    suitableForConditions: ['Cavities', 'Severe Toothache', 'Infected Pulp', 'Sensitivity', 'Swollen Gums'],
    clicks: 165,
    bookingsCount: 42,
    totalRevenue: 35700,
    isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Hollywood Smile Makeover (Porcelain Veneers Set)',
    category: 'Cosmetic',
    description: 'Transformation of smile aesthetics with ultra-thin, custom-shaded porcelain veneers correcting shape, color, symmetry, and alignment.',
    targetAgeMin: 18,
    targetAgeMax: 65,
    price: 3200,
    originalPrice: 4000,
    discountPercentage: 20,
    tax: 100,
    insuranceCovered: 0,
    duration: '2-3 Weeks',
    treatmentSteps: [
      { stepNo: 1, title: 'Digital Smile Design & Trial Mockup', description: 'Photographic aesthetic analysis and temporary trial fitting', estimatedDuration: '1 Visit', status: 'Pending' },
      { stepNo: 2, title: 'Micro-Enamel Preparation', description: 'Minimal surface prep for maximum veneer adhesion', estimatedDuration: '1 Visit', status: 'Pending' },
      { stepNo: 3, title: 'Hand-Layered Master Ceramic Bond', description: 'Permanent light-cured resin bonding of individual veneers', estimatedDuration: '1 Visit', status: 'Pending' }
    ],
    suitableForConditions: ['Discoloration', 'Chipped Tooth', 'Irregular Teeth Shape', 'Smile Aesthetics'],
    clicks: 180,
    bookingsCount: 15,
    totalRevenue: 48000,
    isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Pediatric Preventive Care & Fluoride Sealer Plan',
    category: 'Pediatric',
    description: 'Gentle, child-friendly dental maintenance including cavity-shielding pit sealant, fluoride varnish, and oral habits coaching.',
    targetAgeMin: 2,
    targetAgeMax: 14,
    price: 180,
    originalPrice: 220,
    discountPercentage: 18,
    tax: 10,
    insuranceCovered: 140,
    duration: '1 Visit',
    treatmentSteps: [
      { stepNo: 1, title: 'Gentle Kiddie Examination & Interactive Demo', description: 'Friendly checkup using fun educational props', estimatedDuration: '15 Mins', status: 'Pending' },
      { stepNo: 2, title: 'Molar Pit & Fissure Sealants', description: 'Protective composite barrier over biting surfaces', estimatedDuration: '20 Mins', status: 'Pending' },
      { stepNo: 3, title: 'Bubblegum Enamel Fluoride Shield', description: 'Fast-acting fluoride varnish application', estimatedDuration: '5 Mins', status: 'Pending' }
    ],
    suitableForConditions: ['Early Cavities', 'Plaque', 'Sensitivity', 'Pediatric Hygiene'],
    clicks: 74,
    bookingsCount: 31,
    totalRevenue: 5580,
    isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800'
  }
];

export const seedTreatmentPlans = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dentist-db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('🌱 Connected to MongoDB for seeding treatment plans.');
    }

    const existingCount = await TreatmentPlan.countDocuments();
    if (existingCount === 0) {
      await TreatmentPlan.insertMany(samplePlans);
      console.log(`✅ Seeded ${samplePlans.length} initial treatment plans into database!`);
    } else {
      console.log(`ℹ️ Treatment plans collection already populated (${existingCount} plans exist).`);
    }
  } catch (error) {
    console.error('❌ Error seeding treatment plans:', error);
  }
};

// Execute if run directly via command line
if (process.argv[1] && process.argv[1].includes('seedTreatmentPlans')) {
  seedTreatmentPlans().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

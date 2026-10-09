import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Branch from './models/Branch.js';
import Doctor from './models/Doctor.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db';

const branches = [
  {
    name: 'DentoCare Downtown',
    address: '123 Main Street, Suite 200',
    city: 'Austin',
    phone: '512-205-1826',
    email: 'downtown@dentocare.com',
    openingHours: 'Mon-Fri 8AM-7PM, Sat 9AM-3PM',
  },
  {
    name: 'DentoCare Westlake',
    address: '456 Bee Cave Road, Building C',
    city: 'Westlake Hills',
    phone: '512-305-2937',
    email: 'westlake@dentocare.com',
    openingHours: 'Mon-Fri 9AM-6PM',
  },
  {
    name: 'DentoCare North',
    address: '789 Research Blvd, Unit 100',
    city: 'Round Rock',
    phone: '512-405-3048',
    email: 'north@dentocare.com',
    openingHours: 'Mon-Sat 8AM-8PM',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if branches already exist
    const branchCount = await Branch.countDocuments();
    if (branchCount > 0) {
      console.log(`⚠️ Branches already exist (${branchCount}). Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    // Create branches
    const createdBranches = await Branch.insertMany(branches);
    console.log(`✅ Created ${createdBranches.length} branches`);

    // Create doctors for each branch
    const doctors = [
      // Downtown branch
      { name: 'Dr. Sarah Johnson', specialty: 'General Dentistry', phone: '512-100-0001', email: 'sarah@dentocare.com', branch: createdBranches[0]._id, experience: 12, isAvailable: true },
      { name: 'Dr. Michael Chen', specialty: 'Orthodontics', phone: '512-100-0002', email: 'michael@dentocare.com', branch: createdBranches[0]._id, experience: 8, isAvailable: true },
      // Westlake branch
      { name: 'Dr. Emily Rodriguez', specialty: 'Cosmetic Dentistry', phone: '512-200-0001', email: 'emily@dentocare.com', branch: createdBranches[1]._id, experience: 15, isAvailable: true },
      { name: 'Dr. James Park', specialty: 'Endodontics', phone: '512-200-0002', email: 'james@dentocare.com', branch: createdBranches[1]._id, experience: 10, isAvailable: false },
      // North branch
      { name: 'Dr. Priya Patel', specialty: 'Pediatric Dentistry', phone: '512-300-0001', email: 'priya@dentocare.com', branch: createdBranches[2]._id, experience: 7, isAvailable: true },
      { name: 'Dr. David Kim', specialty: 'Oral Surgery', phone: '512-300-0002', email: 'david@dentocare.com', branch: createdBranches[2]._id, experience: 20, isAvailable: true },
    ];

    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(`✅ Created ${createdDoctors.length} doctors`);

    console.log('');
    console.log('🏥 Seed Summary:');
    for (const b of createdBranches) {
      const docs = createdDoctors.filter(d => d.branch.toString() === b._id.toString());
      console.log(`  📍 ${b.name} (${b.city}): ${docs.map(d => d.name).join(', ')}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Seed complete. Disconnected.');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();

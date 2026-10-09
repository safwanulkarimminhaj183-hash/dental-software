// seedClinic.js — run: node server/seedClinic.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Clinic, { DEFAULT_CLINIC } from './models/Clinic.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');

    await Clinic.deleteMany({});
    const clinic = await Clinic.create(DEFAULT_CLINIC);
    console.log(`✅ Seeded clinic: ${clinic.name}`);
    console.log(`   ${clinic.address}`);
    console.log(`   Hours: ${clinic.openingHours?.summary || clinic.openingHours}`);

    await mongoose.disconnect();
    console.log('\n🎉 Clinic seeding complete! GET http://localhost:5000/api/clinic-info');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

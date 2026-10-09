import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db';

const seedUser = async () => {
  try {
    console.log(`Connecting to MongoDB: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully.');

    const email = 'safwan12@gmail.com';
    const plainPassword = '123456';
    const name = 'Safwan';
    const role = 'super_admin';

    // 1. Hash the password with bcrypt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update password with fresh bcrypt hash
      existingUser.password = hashedPassword;
      existingUser.name = name;
      existingUser.role = role;
      await existingUser.save();

      console.log('User already exists. Updated user with hashed password:');
      console.log({
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        passwordHash: existingUser.password,
      });
    } else {
      // 3. Create new user with hashed password
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      console.log('User inserted successfully:');
      console.log({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        passwordHash: newUser.password,
      });
    }

    console.log('\n--- Test Credentials ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${plainPassword}`);
    console.log('------------------------\n');
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedUser();

import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';

const connectDB = async () => {
  const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db';

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB Error: ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection skipped: ${error.message}`);
    console.warn(`   Server will continue operating with in-memory / local storage fallback.`);
  }
};

// Database queries helper object
const queries = {
  // Appointment Queries
  async createAppointment(data) {
    const appointment = new Appointment(data);
    return await appointment.save();
  },

  async getAllAppointments(filter = {}, sort = { createdAt: -1 }) {
    return await Appointment.find(filter).sort(sort);
  },

  async getAppointmentById(id) {
    return await Appointment.findById(id);
  },

  async updateAppointment(id, updateData) {
    return await Appointment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async updateAppointmentStatus(id, status) {
    return await Appointment.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  },

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  },

  // User Queries
  async findUserByEmail(email) {
    return await User.findOne({ email });
  },

  async findUserById(id) {
    return await User.findById(id).select('-password');
  },

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  },

  async getAllUsers(filter = {}) {
    return await User.find(filter).select('-password');
  },

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  },

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  },

  // Availability Queries
  async createAvailability(data) {
    const availability = new Availability(data);
    return await availability.save();
  },

  async getAllAvailabilities(filter = {}) {
    return await Availability.find(filter);
  },

  async getAvailabilityById(id) {
    return await Availability.findById(id);
  },

  async updateAvailability(id, updateData) {
    return await Availability.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async deleteAvailability(id) {
    return await Availability.findByIdAndDelete(id);
  }
};

// Attach properties to connectDB for backward-compatibility with default import
connectDB.connectDB = connectDB;
connectDB.queries = queries;

export { connectDB, queries };
export default connectDB;

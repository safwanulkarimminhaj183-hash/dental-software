import mongoose from 'mongoose';

/**
 * Database Connection & Configuration Manager
 * Supports MongoDB (Primary document store for EHR/Appointments/Chat)
 * and MySQL/PostgreSQL transactional options.
 */
export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/dentist_clinic_db';
    const conn = await mongoose.connect(connStr, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // In production, fallback to retry mechanism or controlled degrade
  }
};

/**
 * MySQL Configuration Schema reference (for relational deployment alternative)
 */
export const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'dentist_clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

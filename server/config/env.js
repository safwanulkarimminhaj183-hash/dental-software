// config/env.js
// Load environment variables and export a config object
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/dentist',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  emailService: process.env.EMAIL_SERVICE || 'sendgrid',
  emailApiKey: process.env.EMAIL_API_KEY || '',
  smsService: process.env.SMS_SERVICE || 'twilio',
  smsApiKey: process.env.SMS_API_KEY || ''
};

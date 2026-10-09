import { body, validationResult } from 'express-validator';

// Middleware to evaluate validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules for Contact Form Submission
export const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name field is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email field is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number (e.g. +1 512-205-1826 or 01712345678).'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message field is required.')
    .isLength({ min: 3, max: 2000 })
    .withMessage('Message must be between 3 and 2000 characters.')
    .escape(),
];

// Validation rules for Appointment Booking
export const appointmentValidationRules = [
  body(['name', 'patientName'])
    .custom((value, { req }) => {
      const name = req.body.name || req.body.patientName;
      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error('Patient name is required.');
      }
      if (name.trim().length < 2 || name.trim().length > 100) {
        throw new Error('Name must be between 2 and 100 characters.');
      }
      return true;
    }),
  body(['email', 'patientEmail'])
    .custom((value, { req }) => {
      const email = req.body.email || req.body.patientEmail;
      if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        throw new Error('Please provide a valid email address.');
      }
      return true;
    }),
  body(['phone', 'patientPhone'])
    .custom((value, { req }) => {
      const phone = req.body.phone || req.body.patientPhone;
      if (!phone || !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone.trim())) {
        throw new Error('Please provide a valid phone number.');
      }
      return true;
    }),
  body(['department', 'serviceName', 'service'])
    .custom((value, { req }) => {
      const dept = req.body.department || req.body.serviceName || req.body.service;
      if (!dept || !dept.trim()) {
        throw new Error('Please specify a department or service.');
      }
      return true;
    }),
  body(['appointmentDate', 'date'])
    .custom((value, { req }) => {
      const dateVal = req.body.appointmentDate || req.body.date;
      if (!dateVal) {
        throw new Error('Appointment date is required.');
      }
      const parsed = new Date(dateVal);
      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid appointment date format.');
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed < today) {
        throw new Error('Appointment date cannot be in the past.');
      }
      return true;
    }),
  body(['appointmentTime', 'time'])
    .custom((value, { req }) => {
      const timeVal = req.body.appointmentTime || req.body.time;
      if (!timeVal || !timeVal.trim()) {
        throw new Error('Appointment time is required.');
      }
      return true;
    }),
];

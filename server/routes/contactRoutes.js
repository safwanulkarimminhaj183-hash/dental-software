import express from 'express';
import {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';
import { contactValidationRules, validate } from '../middleware/validators.js';
import { formSubmissionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/contact OR POST /api/contacts
// @desc    Submit contact inquiry (Rate limited & Validated)
router.post('/', formSubmissionLimiter, contactValidationRules, validate, submitContactForm);
router.post('/submit', formSubmissionLimiter, contactValidationRules, validate, submitContactForm);

// @route   GET /api/contacts OR GET /api/contact
// @desc    Get all contacts for Admin Panel
router.get('/', getAllContacts);

// @route   PATCH /api/contacts/:id OR PATCH /api/contact/:id
// @desc    Update contact status
router.patch('/:id', updateContactStatus);

// @route   DELETE /api/contacts/:id
// @desc    Delete contact message
router.delete('/:id', deleteContact);

export default router;
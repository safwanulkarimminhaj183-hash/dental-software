import Contact from '../models/Contact.js';
import { sendContactEmails } from '../utils/mailer.js';

/**
 * @desc    Submit Contact Form
 * @route   POST /api/contact OR POST /api/contacts
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // 1. Save data to MongoDB
    const newContact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      status: 'Unread',
    });

    const savedContact = await newContact.save();

    // 2. Trigger Nodemailer Dual Notification in background
    sendContactEmails({
      name: savedContact.name,
      email: savedContact.email,
      phone: savedContact.phone,
      message: savedContact.message,
      createdAt: savedContact.createdAt,
    }).catch((mailErr) => {
      console.warn('⚠️ Nodemailer background delivery failed:', mailErr.message);
    });

    // 3. Respond with JSON
    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully! We have sent a confirmation email.',
      data: savedContact,
    });
  } catch (error) {
    console.error('❌ Error in submitContactForm:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting contact form.',
    });
  }
};

/**
 * @desc    Get All Contact Messages (Admin access)
 * @route   GET /api/contacts OR GET /api/contact
 * @access  Admin / Protected
 */
export const getAllContacts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && ['Unread', 'Read', 'Replied'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: contacts.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
      data: contacts,
    });
  } catch (error) {
    console.error('❌ Error in getAllContacts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching contact submissions.',
    });
  }
};

/**
 * @desc    Update Contact Inquiry Status
 * @route   PATCH /api/contacts/:id OR PATCH /api/contact/:id
 * @access  Admin / Protected
 */
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Unread', 'Read', 'Replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Unread', 'Read', or 'Replied'.",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contact status updated to '${status}'.`,
      data: contact,
    });
  } catch (error) {
    console.error('❌ Error in updateContactStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating contact status.',
    });
  }
};

/**
 * @desc    Delete Contact Message
 * @route   DELETE /api/contacts/:id
 * @access  Admin
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
  deleteContact,
};
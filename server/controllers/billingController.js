import mongoose from 'mongoose';
import Billing from '../models/Billing.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all invoices with optional filters
// @route   GET /api/billing
// @access  Protected (admin / receptionist)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllBilling = async (req, res) => {
  try {
    const {
      paymentStatus,
      specialistId,
      patientId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (paymentStatus) filter.paymentStatus = paymentStatus.toLowerCase();
    if (specialistId && mongoose.Types.ObjectId.isValid(specialistId)) {
      filter.specialistId = specialistId;
    }
    if (patientId) filter.patientId = { $regex: patientId, $options: 'i' };

    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientEmail: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { specialistName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [invoices, total] = await Promise.all([
      Billing.find(filter)
        .populate('specialistId', 'name specialization profileImage')
        .sort({ invoiceDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Billing.countDocuments(filter),
    ]);

    // Summary totals for the current filter set
    const summary = await Billing.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          totalInvoices: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      summary: summary[0] || { totalRevenue: 0, totalPaid: 0, totalDue: 0, totalInvoices: 0 },
      data: invoices,
    });
  } catch (error) {
    console.error('getAllBilling error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single invoice by ID or invoiceNumber
// @route   GET /api/billing/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const getBillingById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const invoice = isObjectId
      ? await Billing.findById(id).populate('specialistId', 'name specialization profileImage')
      : await Billing.findOne({ invoiceNumber: id.toUpperCase() }).populate('specialistId', 'name specialization profileImage');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new invoice
// @route   POST /api/billing
// @access  Protected (receptionist / admin)
// ─────────────────────────────────────────────────────────────────────────────
export const createBilling = async (req, res) => {
  try {
    const { patientName, items } = req.body;

    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ success: false, message: 'Patient name is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one billing item is required.' });
    }

    // Validate each item has procedure + unitPrice
    for (const item of items) {
      if (!item.procedure || !item.procedure.trim()) {
        return res.status(400).json({ success: false, message: 'Each item must have a procedure name.' });
      }
      if (item.unitPrice === undefined || isNaN(Number(item.unitPrice)) || Number(item.unitPrice) < 0) {
        return res.status(400).json({ success: false, message: `Invalid unit price for procedure: ${item.procedure}` });
      }
    }

    const invoice = await Billing.create(req.body);

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} created successfully.`,
      data: invoice,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update invoice (add items, change totals)
// @route   PUT /api/billing/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID.' });
    }

    const existing = await Billing.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // Merge update
    Object.assign(existing, req.body);
    await existing.save(); // triggers pre-save totals recalculation

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully.',
      data: existing,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Record a payment against an invoice
// @route   PATCH /api/billing/:id/payment
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID.' });
    }

    const { amount, paymentMethod, paymentDate, notes } = req.body;

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payment amount is required.' });
    }

    const invoice = await Billing.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    invoice.paidAmount = (invoice.paidAmount || 0) + Number(amount);
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    if (notes) invoice.notes = notes;

    await invoice.save(); // triggers auto-status update

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get treatment fee list (distinct procedures + avg prices)
// @route   GET /api/billing/fees
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getTreatmentFees = async (req, res) => {
  try {
    const fees = await Billing.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.procedure',
          averageFee: { $avg: '$items.unitPrice' },
          minFee: { $min: '$items.unitPrice' },
          maxFee: { $max: '$items.unitPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Merge with static procedure catalog if DB is empty
    const catalog = [
      { _id: 'Root Canal Treatment', averageFee: 8000, minFee: 6000, maxFee: 12000, count: 0 },
      { _id: 'Teeth Scaling & Cleaning', averageFee: 1500, minFee: 1000, maxFee: 2500, count: 0 },
      { _id: 'Dental Implant', averageFee: 25000, minFee: 20000, maxFee: 35000, count: 0 },
      { _id: 'Tooth Extraction', averageFee: 2000, minFee: 1500, maxFee: 3500, count: 0 },
      { _id: 'Teeth Whitening', averageFee: 5000, minFee: 3000, maxFee: 8000, count: 0 },
      { _id: 'Dental Crown', averageFee: 10000, minFee: 7000, maxFee: 15000, count: 0 },
      { _id: 'Orthodontic Braces', averageFee: 40000, minFee: 30000, maxFee: 60000, count: 0 },
      { _id: 'Laser Gum Treatment', averageFee: 12000, minFee: 8000, maxFee: 18000, count: 0 },
      { _id: 'Composite Filling', averageFee: 2500, minFee: 1500, maxFee: 4000, count: 0 },
      { _id: 'Pediatric Checkup', averageFee: 800, minFee: 500, maxFee: 1200, count: 0 },
    ];

    const result = fees.length > 0 ? fees : catalog;

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete invoice
// @route   DELETE /api/billing/:id
// @access  Protected (super_admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteBilling = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID.' });
    }

    const deleted = await Billing.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    return res.status(200).json({ success: true, message: 'Invoice deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBilling,
  recordPayment,
  getTreatmentFees,
  deleteBilling,
};

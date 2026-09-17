// backend/controllers/billingController.js
import asyncHandler from '../utils/asyncHandler.js';
import Invoice from '../models/Invoice.js';
import Billing from '../models/Billing.js';
import Patient from '../models/Patient.js';
import { processPayment } from '../services/paymentService.js';
import { generateInvoiceHTML } from '../../utils/pdfGenerator.js';
import PDFDocument from 'pdfkit';
import mongoose from 'mongoose';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute totals from line items and apply tax/discount. */
const computeTotals = (items, taxRate = 0.15, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const totalAmount = parseFloat((subtotal + tax - discount).toFixed(2));
  return { subtotal: parseFloat(subtotal.toFixed(2)), tax, totalAmount };
};

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc   Initiate a payment & create / update an invoice
 * @route  POST /api/payments/initiate
 * @access Protected (patient or staff)
 *
 * Body: {
 *   patientId, appointmentId?, amount, method ('bkash'|'nagad'|'card'),
 *   paymentDetails?, items?, discount?, notes?
 * }
 */
export const initiatePayment = asyncHandler(async (req, res) => {
  const {
    patientId,
    appointmentId,
    amount,
    method,
    paymentDetails,
    items = [],
    discount = 0,
    notes,
  } = req.body;

  if (!patientId || !amount || !method) {
    return res.status(400).json({
      success: false,
      message: 'patientId, amount and method are required.',
    });
  }
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ success: false, message: 'Invalid patientId.' });
  }

  const patient = await Patient.findById(patientId).lean();
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  // Build line items — if none provided, create a single generic item
  const lineItems = items.length
    ? items.map((i) => ({
        description: i.description || 'Dental service',
        quantity: i.quantity || 1,
        unitCost: i.unitCost || 0,
      }))
    : [{ description: 'Dental service', quantity: 1, unitCost: Number(amount) }];

  const { subtotal, tax, totalAmount } = computeTotals(lineItems, 0.15, Number(discount));

  // Create a provisional unpaid invoice
  const invoice = await Invoice.create({
    patientId,
    appointmentId: appointmentId || undefined,
    items: lineItems,
    subtotal,
    tax,
    discount: Number(discount),
    totalAmount,
    paymentMethod: method,
    notes,
    status: 'unpaid',
  });

  // Process payment through the gateway adapter
  let transaction;
  try {
    transaction = await processPayment({
      amount: totalAmount,
      method,
      paymentDetails,
      invoiceId: invoice._id,
    });
  } catch (gatewayErr) {
    // Mark invoice as failed but don't delete it (for audit)
    await Invoice.findByIdAndUpdate(invoice._id, { status: 'failed' });
    return res.status(502).json({
      success: false,
      message: `Payment gateway error: ${gatewayErr.message}`,
      invoiceId: invoice._id,
    });
  }

  // Update invoice with gateway result
  invoice.transactionId = transaction.transactionId;
  invoice.gatewayResponse = transaction.raw;
  invoice.status = transaction.success ? 'paid' : 'failed';
  if (transaction.success) invoice.paidAt = new Date();
  await invoice.save();

  // Create a billing transaction record
  await Billing.create({
    invoiceId: invoice._id,
    patientId,
    appointmentId: appointmentId || undefined,
    amount: totalAmount,
    method,
    transactionId: transaction.transactionId,
    status: transaction.success ? 'paid' : 'failed',
    paidAt: transaction.success ? new Date() : undefined,
    rawGatewayResponse: transaction.raw,
  });

  res.status(201).json({
    success: transaction.success,
    message: transaction.message,
    invoice,
    transactionId: transaction.transactionId,
  });
});

/**
 * @desc   Download a PDF invoice receipt
 * @route  GET /api/invoices/:id/download
 * @access Protected (owning patient or admin/staff)
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('patientId', 'firstName lastName phone')
    .populate('appointmentId', 'slot doctorId')
    .lean();

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  // Authorisation: only the owning patient or staff can download
  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  if (!isAdmin && invoice.patientId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const patientName = `${invoice.patientId.firstName} ${invoice.patientId.lastName}`;

  // Build PDF using pdfkit
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  });

  // ── PDF content ──────────────────────────────────────────────────────────
  doc
    .fontSize(22)
    .fillColor('#0077b6')
    .text('SMILE CARE DENTAL CLINIC', { align: 'center' })
    .moveDown(0.3);

  doc
    .fontSize(10)
    .fillColor('#555')
    .text('123 Healthcare Boulevard, Dhaka, Bangladesh', { align: 'center' })
    .text('Tel: +880 1700-000000  |  help@smiledental.com', { align: 'center' })
    .moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#0077b6').stroke().moveDown(0.5);

  doc
    .fontSize(18)
    .fillColor('#222')
    .text('INVOICE', { align: 'right' })
    .fontSize(10)
    .fillColor('#555')
    .text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' })
    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-BD')}`, { align: 'right' })
    .text(`Status: ${invoice.status.toUpperCase()}`, { align: 'right' })
    .moveDown();

  doc
    .fontSize(11)
    .fillColor('#333')
    .text(`Billed To:`, { underline: true })
    .fontSize(10)
    .fillColor('#555')
    .text(`Name: ${patientName}`)
    .text(`Phone: ${invoice.patientId.phone || 'N/A'}`)
    .moveDown();

  // Items table
  const tableTop = doc.y + 10;
  doc.fontSize(10).fillColor('#0077b6')
    .text('#', 50, tableTop)
    .text('Description', 80, tableTop)
    .text('Qty', 360, tableTop)
    .text('Unit Cost', 410, tableTop)
    .text('Total', 490, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#ddd').stroke();

  let rowY = tableTop + 22;
  invoice.items.forEach((item, i) => {
    doc.fontSize(10).fillColor('#333')
      .text(String(i + 1), 50, rowY)
      .text(item.description, 80, rowY, { width: 270 })
      .text(String(item.quantity), 360, rowY)
      .text(`৳${item.unitCost.toFixed(2)}`, 410, rowY)
      .text(`৳${(item.quantity * item.unitCost).toFixed(2)}`, 490, rowY);
    rowY += 20;
  });

  doc.moveTo(50, rowY + 5).lineTo(550, rowY + 5).strokeColor('#ddd').stroke();
  rowY += 15;

  doc.fontSize(10).fillColor('#555')
    .text(`Subtotal:`, 400, rowY).text(`৳${invoice.subtotal.toFixed(2)}`, 490, rowY)
    .text(`Tax (15%):`, 400, rowY + 16).text(`৳${invoice.tax.toFixed(2)}`, 490, rowY + 16)
    .text(`Discount:`, 400, rowY + 32).text(`-৳${invoice.discount.toFixed(2)}`, 490, rowY + 32);

  doc.fontSize(12).fillColor('#0077b6')
    .text(`TOTAL:`, 400, rowY + 52)
    .text(`৳${invoice.totalAmount.toFixed(2)}`, 490, rowY + 52);

  doc.moveDown(5)
    .fontSize(9).fillColor('#999')
    .text(
      'Thank you for choosing Smile Care Dental Clinic. This is a computer-generated receipt.',
      { align: 'center' }
    );

  doc.end();
});

/**
 * @desc   Get all invoices for the authenticated patient
 * @route  GET /api/invoices/my
 * @access Protected (patient)
 */
export const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('appointmentId', 'slot')
    .lean();

  res.json({ success: true, count: invoices.length, invoices });
});

/**
 * @desc   Get a single invoice by ID
 * @route  GET /api/invoices/:id
 * @access Protected (owning patient or staff/admin)
 */
export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('patientId', 'firstName lastName email phone')
    .populate('appointmentId', 'slot')
    .lean();

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  if (!isAdmin && invoice.patientId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, invoice });
});

/**
 * @desc   List all invoices (admin dashboard)
 * @route  GET /api/invoices
 * @access Protected (admin, staff)
 */
export const getAllInvoices = asyncHandler(async (req, res) => {
  const { status, patientId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (patientId && mongoose.Types.ObjectId.isValid(patientId)) filter.patientId = patientId;

  const skip = (Number(page) - 1) * Number(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patientId', 'firstName lastName email')
      .lean(),
    Invoice.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    invoices,
  });
});

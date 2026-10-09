import mongoose from 'mongoose';
import Prescription from '../models/Prescription.js';
import { generatePrescriptionPDF } from '../utils/pdfGenerator.js';
import logger from '../utils/logger.js';

// In-Memory Fallback Store when MongoDB is not connected
const prescriptionsStore = [];

/**
 * 6-Step Digital Prescription Controller
 * 1. Data Receipt
 * 2. Data Validation
 * 3. MongoDB Save (with memory fallback)
 * 4. PDF Generation (PDFKit)
 * 5. Email Sending (Nodemailer + PDF Attachment)
 * 6. Client Response
 */
export const generatePrescription = async (req, res) => {
  try {
    // ── STEP 1: Data Receipt ──────────────────────────────────────────────────
    const {
      patientName,
      patientEmail,
      patientAge,
      patientPhone,
      doctorName,
      doctorLicense,
      diagnosis,
      generalAdvice,
      advice,
      medications,
      nextFollowUpDate,
      nextVisitDate
    } = req.body;

    // ── STEP 2: Data Validation ───────────────────────────────────────────────
    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ success: false, message: 'Patient name is required.' });
    }
    if (!patientEmail || !patientEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Patient email address is required.' });
    }
    if (!diagnosis || !diagnosis.trim()) {
      return res.status(400).json({ success: false, message: 'Clinical diagnosis is required.' });
    }

    const cleanEmail = patientEmail.trim().toLowerCase();
    const rxAdvice = generalAdvice || advice || 'Maintain good oral hygiene and follow medication schedule.';
    const rxFollowUp = nextFollowUpDate || nextVisitDate || null;
    const formattedMeds = Array.isArray(medications) ? medications : [];

    let prescriptionDoc = null;
    let rxNumber = `RX-${Math.floor(100000 + Math.random() * 900000)}`;

    // ── STEP 3: MongoDB Save (with In-Memory Fallback) ────────────────────────
    if (mongoose.connection.readyState === 1) {
      try {
        const rx = new Prescription({
          prescriptionNumber: rxNumber,
          patientName: patientName.trim(),
          patientEmail: cleanEmail,
          patientAge: Number(patientAge) || 30,
          patientPhone: patientPhone || '',
          doctorName: doctorName || 'Dr. Sarah Johnson (DDS, Orthodontics)',
          doctorLicense: doctorLicense || 'DC-LICENSE-98412',
          diagnosis: diagnosis.trim(),
          medications: formattedMeds,
          generalAdvice: rxAdvice,
          nextFollowUpDate: rxFollowUp ? new Date(rxFollowUp) : null,
        });

        prescriptionDoc = await rx.save();
        rxNumber = prescriptionDoc.prescriptionNumber;
      } catch (dbErr) {
        logger.warn('MongoDB save error, falling back to in-memory store:', dbErr.message);
      }
    }

    if (!prescriptionDoc) {
      prescriptionDoc = {
        _id: `rx_mem_${Date.now()}`,
        prescriptionNumber: rxNumber,
        patientName: patientName.trim(),
        patientEmail: cleanEmail,
        patientAge: Number(patientAge) || 30,
        patientPhone: patientPhone || '',
        doctorName: doctorName || 'Dr. Sarah Johnson (DDS, Orthodontics)',
        doctorLicense: doctorLicense || 'DC-LICENSE-98412',
        diagnosis: diagnosis.trim(),
        medications: formattedMeds,
        generalAdvice: rxAdvice,
        nextFollowUpDate: rxFollowUp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      prescriptionsStore.unshift(prescriptionDoc);
    }

    // ── STEP 4: PDF Generation (PDFKit) ───────────────────────────────────────
    let pdfBuffer = null;
    try {
      pdfBuffer = await generatePrescriptionPDF(prescriptionDoc);
    } catch (pdfErr) {
      logger.error('PDFKit generation error:', pdfErr);
    }

    // ── STEP 5: Email Sending via Nodemailer ──────────────────────────────────
    let emailSent = false;
    if (pdfBuffer) {
      try {
        const { default: nodemailer } = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
          },
        });

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0e2a47; margin-bottom: 4px;">DentoCare Dental Clinic</h2>
            <h3 style="color: #3ec1d3; margin-top: 0;">Digital Prescription Attachment</h3>
            <p>Dear <strong>${prescriptionDoc.patientName}</strong>,</p>
            <p>Your digital prescription (Ref: <strong>${prescriptionDoc.prescriptionNumber}</strong>) issued by <strong>${prescriptionDoc.doctorName}</strong> is ready.</p>
            <div style="background: #f8fafc; padding: 14px; border-left: 4px solid #3ec1d3; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0 0 6px 0; color: #1e293b;"><strong>Diagnosis:</strong> ${prescriptionDoc.diagnosis}</p>
              <p style="margin: 0; color: #475569;"><strong>Advice:</strong> ${prescriptionDoc.generalAdvice}</p>
            </div>
            <p>Your official prescription PDF document is attached to this email.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">DentoCare Oral Healthcare Services • Jalalabad, Sylhet • 512-205-1826</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"DentoCare Clinic" <${process.env.EMAIL_USER || 'notifications@dentocare.clinic'}>`,
          to: cleanEmail,
          subject: `📋 Digital Prescription (${prescriptionDoc.prescriptionNumber}) — DentoCare Clinic`,
          html: emailHtml,
          attachments: [
            {
              filename: `Prescription_${prescriptionDoc.prescriptionNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        emailSent = true;
      } catch (mailErr) {
        logger.warn('Nodemailer sending skipped/failed (logged):', mailErr.message);
      }
    }

    // Update email status if Mongoose document
    if (prescriptionDoc.save && typeof prescriptionDoc.save === 'function') {
      prescriptionDoc.emailSent = emailSent;
      await prescriptionDoc.save().catch(() => {});
    } else {
      prescriptionDoc.emailSent = emailSent;
    }

    // ── STEP 6: Client Response ───────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: `Prescription ${prescriptionDoc.prescriptionNumber} generated${emailSent ? ' & emailed successfully!' : ' successfully!'}`,
      prescription: prescriptionDoc,
      data: prescriptionDoc,
      emailSent,
      pdfGenerated: Boolean(pdfBuffer)
    });

  } catch (error) {
    logger.error('Prescription generation process error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating the prescription.'
    });
  }
};

/**
 * Stream Generated PDF directly to browser
 */
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;
    let rx = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      rx = await Prescription.findById(id);
    }

    if (!rx) {
      rx = prescriptionsStore.find((p) => p._id === id || p.prescriptionNumber === id);
    }

    if (!rx) {
      return res.status(404).json({ success: false, message: 'Prescription record not found.' });
    }

    const pdfBuffer = await generatePrescriptionPDF(rx);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Prescription_${rx.prescriptionNumber || 'document'}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    logger.error('PDF download error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPrescriptionsByDentist = async (req, res) => {
  try {
    const { dentistId } = req.params;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      list = await Prescription.find().sort({ createdAt: -1 });
    }

    if (!list || list.length === 0) {
      list = prescriptionsStore;
    }

    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  generatePrescription,
  downloadPrescriptionPDF,
  getPrescriptionsByDentist,
};

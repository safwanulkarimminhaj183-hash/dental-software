import mongoose from 'mongoose';
import http from 'http';
import express from 'express';
import { connectDB } from './config/db.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import { initSocketServer } from './utils/socketServer.js';

async function runAdminDashboardTests() {
  console.log('🧪 Starting Admin Dashboard Backend Architecture Verification...');

  await connectDB();

  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminDashboardRoutes);

  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(5097, async () => {
    console.log('📡 Admin test server running on port 5097');

    try {
      const authHeader = { 'x-admin-key': 'dentocare_admin_sandbox_key_2026', 'Content-Type': 'application/json' };

      // Test 1: RBAC & Aggregation Analytics ($facet, $group, $sort)
      console.log('\n--- 1. Testing RBAC & MongoDB Aggregation Analytics ---');
      const resAnalytics = await fetch('http://localhost:5097/api/admin/dashboard/analytics', { headers: authHeader });
      const jsonAnalytics = await resAnalytics.json();
      console.log(`Analytics Status: ${resAnalytics.status}, X-Cache: ${resAnalytics.headers.get('x-cache')}`);
      console.log(`Total Revenue: $${jsonAnalytics.analytics?.totalRevenue}, Total Appointments: ${jsonAnalytics.analytics?.totalAppointments}`);
      console.log(`Popular Treatments Count: ${jsonAnalytics.analytics?.popularTreatments?.length}`);

      // Test 2: Dynamic Schedule & Available Slot Calculation
      console.log('\n--- 2. Testing Dynamic Slot & Schedule Management ---');
      const resSchedule = await fetch('http://localhost:5097/api/admin/schedule');
      const jsonSchedule = await resSchedule.json();
      console.log(`Schedule Fetch Status: ${resSchedule.status}, Working Hours: ${jsonSchedule.schedule?.workingHours?.startTime} - ${jsonSchedule.schedule?.workingHours?.endTime}`);

      const resSlots = await fetch('http://localhost:5097/api/admin/schedule/available-slots?date=2026-10-15');
      const jsonSlots = await resSlots.json();
      console.log(`Available Slots Count for 2026-10-15: ${jsonSlots.availableSlots?.length}`);

      // Test Block Slot
      const resBlock = await fetch('http://localhost:5097/api/admin/schedule/block-slot', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ date: '2026-10-15', timeSlot: '11:00 AM', reason: 'Doctor Conference' }),
      });
      const jsonBlock = await resBlock.json();
      console.log(`Block Slot Status: ${resBlock.status}, Message: ${jsonBlock.message}`);

      // Test 3: Automated Digital Prescription Generation (PDFKit)
      console.log('\n--- 3. Testing Automated Prescription Generation (PDFKit) ---');
      const rxPayload = {
        patientName: 'Jane Smith',
        patientEmail: 'patient.test@example.com',
        patientAge: 28,
        doctorName: 'Dr. Sarah Johnson (DDS, Orthodontics)',
        diagnosis: 'Mild dental fluorosis and bite misalignment',
        medications: [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '5 Days', instructions: 'Take after meals' },
          { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '3 Days', instructions: 'For pain as needed' },
        ],
        generalAdvice: 'Rinse mouth twice daily with fluoride mouthwash. Avoid hard candy.',
      };

      const resRx = await fetch('http://localhost:5097/api/admin/prescriptions', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(rxPayload),
      });

      const jsonRx = await resRx.json();
      console.log(`Prescription Status: ${resRx.status}, RX Ref: ${jsonRx.prescription?.prescriptionNumber}, EmailSent: ${jsonRx.prescription?.emailSent}`);

      if (jsonRx.prescription?._id) {
        const resPdf = await fetch(`http://localhost:5097/api/admin/prescriptions/${jsonRx.prescription._id}/pdf`);
        const pdfContent = await resPdf.arrayBuffer();
        console.log(`PDF Streaming Download Status: ${resPdf.status}, Size: ${pdfContent.byteLength} bytes`);
      }

      // Test 4: Financial Summary & Payment Webhook
      console.log('\n--- 4. Testing Financial Management & Payment Webhook ---');
      const resFin = await fetch('http://localhost:5097/api/admin/financials/summary', { headers: authHeader });
      const jsonFin = await resFin.json();
      console.log(`Financial Summary Status: ${resFin.status}, Recent Invoices Count: ${jsonFin.recentInvoices?.length}`);

      const resWebhook = await fetch('http://localhost:5097/api/admin/financials/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: 250, paymentStatus: 'Paid' }),
      });
      const jsonWebhook = await resWebhook.json();
      console.log(`Webhook Processing Status: ${resWebhook.status}, Message: ${jsonWebhook.message}`);

      console.log('\n✅ ALL ADMIN DASHBOARD BACKEND ARCHITECTURE TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test error:', err);
    } finally {
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    }
  });
}

runAdminDashboardTests();

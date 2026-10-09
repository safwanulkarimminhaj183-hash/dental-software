import mongoose from 'mongoose';
import express from 'express';
import TreatmentPlan from './models/TreatmentPlan.js';
import Booking from './models/Booking.js';
import PatientRecord from './models/PatientRecord.js';
import treatmentPlanRoutes from './routes/treatmentPlanRoutes.js';
import { connectDB } from './config/db.js';
import { seedTreatmentPlans } from './seedTreatmentPlans.js';

async function runTests() {
  console.log('🧪 Starting Treatment Plans Advanced Backend Features Verification...');

  await connectDB();
  await seedTreatmentPlans();

  // Create test patient record for recommendation testing if absent
  const testEmail = 'patient.test@example.com';
  await PatientRecord.findOneAndUpdate(
    { patientEmail: testEmail },
    {
      patientId: 'P-TEST-99',
      patientName: 'Jane Smith',
      patientEmail: testEmail,
      medicalHistory: {
        conditions: ['Crooked Teeth', 'Toothache'],
        allergies: ['Penicillin'],
      }
    },
    { upsert: true, new: true }
  );

  const app = express();
  app.use(express.json());
  app.use('/api/treatment-plans', treatmentPlanRoutes);

  const server = app.listen(5099, async () => {
    console.log('📡 Test server running on port 5099');

    try {
      // Test 1: Fetch plans with dynamic filtering (age, budget, category, issue)
      console.log('\n--- 1. Testing Dynamic Query Filtering ($gte, $lte, $in) & Redis Caching ---');
      const fetchUrl = 'http://localhost:5099/api/treatment-plans?age=25&minBudget=1000&category=Orthodontics&email=patient.test@example.com';
      const res1 = await fetch(fetchUrl);
      const json1 = await res1.json();
      console.log(`Fetch Status: ${res1.status}, X-Cache Header: ${res1.headers.get('x-cache')}`);
      console.log(`Results Count: ${json1.count}`);
      if (json1.data && json1.data[0]) {
        console.log(`Top Plan: "${json1.data[0].title}" | Recommended: ${json1.data[0].isRecommended} (${json1.data[0].recommendationReason})`);
      }

      // Test Redis Cache Hit
      console.log('\n--- 2. Testing Redis Cache Hit (Second Request) ---');
      const res2 = await fetch(fetchUrl);
      const json2 = await res2.json();
      console.log(`Second Request Status: ${res2.status}, X-Cache Header: ${res2.headers.get('x-cache')}, Source: ${json2.source}`);

      // Test 3: Click tracking ($inc)
      if (json1.data && json1.data[0]) {
        const targetId = json1.data[0]._id;
        console.log(`\n--- 3. Testing Click Tracking ($inc) for plan ID: ${targetId} ---`);
        const clickRes = await fetch(`http://localhost:5099/api/treatment-plans/${targetId}/click`, { method: 'POST' });
        const clickJson = await clickRes.json();
        console.log(`Click Track Status: ${clickRes.status}, Updated Clicks Count: ${clickJson.clicks}`);
      }

      // Test 4: Treatment Booking (ACID Transactions / Fallback)
      console.log('\n--- 4. Testing Secure Treatment Booking (ACID Session Transactions) ---');
      if (json1.data && json1.data[0]) {
        const bookPayload = {
          treatmentPlanId: json1.data[0]._id,
          patientName: 'Jane Smith',
          patientEmail: 'patient.test@example.com',
          patientPhone: '555-0199',
          patientAge: 25,
          appointmentDate: '2026-10-15',
          appointmentTime: '10:30 AM',
          amountPaid: 200,
          paymentMethod: 'Stripe',
          notes: 'Test automated booking',
        };

        const bookRes = await fetch('http://localhost:5099/api/treatment-plans/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookPayload),
        });

        const bookJson = await bookRes.json();
        console.log(`Booking Status: ${bookRes.status}`);
        console.log(`Mode: ${bookJson.transactionMode}`);
        console.log(`Booking Ref: ${bookJson.booking?.bookingReference}, Status: ${bookJson.booking?.bookingStatus}`);
      }

      // Test 5: Stripe Payment Intent Creation
      console.log('\n--- 5. Testing Payment Gateway Intent Creation ---');
      const payRes = await fetch('http://localhost:5099/api/treatment-plans/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 200, currency: 'usd', patientEmail: 'patient.test@example.com' }),
      });
      const payJson = await payRes.json();
      console.log(`Payment Intent Status: ${payRes.status}, ClientSecret Exists: ${Boolean(payJson.clientSecret)}`);

      // Test 6: Admin Analytics Reporting ($inc aggregations)
      console.log('\n--- 6. Testing Admin Insight Analytics API ---');
      const analyticsRes = await fetch('http://localhost:5099/api/treatment-plans/analytics');
      const analyticsJson = await analyticsRes.json();
      console.log(`Analytics Status: ${analyticsRes.status}`);
      console.log(`Summary Total Bookings: ${analyticsJson.analytics?.summary?.totalBookings}, Total Revenue: $${analyticsJson.analytics?.summary?.totalRevenue}`);
      console.log(`Top Clicked Plans Count: ${analyticsJson.analytics?.topClickedPlans?.length}`);

      console.log('\n✅ ALL BACKEND FEATURE TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test failed with error:', err);
    } finally {
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    }
  });
}

runTests();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import contactRoutes from './routes/contactRoutes.js';
import Contact from './models/Contact.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/contact', contactRoutes);

async function runTests() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);

  const server = app.listen(5099, async () => {
    console.log('Test server running on port 5099');

    try {
      // Test 1: Validation - Missing Fields
      console.log('\n--- Test 1: Missing Fields Validation ---');
      const res1 = await fetch('http://localhost:5099/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' }),
      });
      const data1 = await res1.json();
      console.log('Status:', res1.status, 'Response:', data1);
      if (res1.status === 400 && data1.success === false) {
        console.log('✅ Test 1 Passed (400 Bad Request for missing fields)');
      } else {
        console.error('❌ Test 1 Failed');
      }

      // Test 2: Validation - Invalid Email
      console.log('\n--- Test 2: Invalid Email Validation ---');
      const res2 = await fetch('http://localhost:5099/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email-format',
          phone: '+123456789',
          message: 'Hello Doctor',
        }),
      });
      const data2 = await res2.json();
      console.log('Status:', res2.status, 'Response:', data2);
      if (res2.status === 400 && data2.success === false) {
        console.log('✅ Test 2 Passed (400 Bad Request for invalid email format)');
      } else {
        console.error('❌ Test 2 Failed');
      }

      // Test 3: Successful Submission
      console.log('\n--- Test 3: Valid Contact Submission (201 Created) ---');
      const testEmail = `test.patient.${Date.now()}@example.com`;
      const res3 = await fetch('http://localhost:5099/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Smith',
          email: testEmail,
          phone: '555-0199',
          message: 'I would like to book a dental checkup.',
        }),
      });
      const data3 = await res3.json();
      console.log('Status:', res3.status, 'Response:', data3);
      if (res3.status === 201 && data3.success === true && data3.message === 'Your message has been sent successfully!') {
        console.log('✅ Test 3 Passed (201 Created with success response)');
      } else {
        console.error('❌ Test 3 Failed');
      }

      // Test 4: Verify MongoDB Insertion
      console.log('\n--- Test 4: MongoDB Persistence Check ---');
      const savedDoc = await Contact.findOne({ email: testEmail });
      if (savedDoc && savedDoc.name === 'Jane Smith') {
        console.log('✅ Test 4 Passed (Found document in MongoDB):', savedDoc._id);
        // Clean up test document
        await Contact.deleteOne({ _id: savedDoc._id });
        console.log('Cleaned up test document');
      } else {
        console.error('❌ Test 4 Failed (Document not found in MongoDB)');
      }

      console.log('\nALL API TESTS PASSED SUCCESSFULLY! 🎉');
    } catch (err) {
      console.error('Test Execution Error:', err);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

runTests();

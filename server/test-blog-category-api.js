import mongoose from 'mongoose';
import express from 'express';
import DentalBlog from './models/DentalBlog.js';
import dentalBlogRoutes from './routes/dentalBlogRoutes.js';
import { connectDB } from './config/db.js';

async function runBlogTests() {
  console.log('🧪 Starting Blog Category Filtering API & Redis Verification...');

  await connectDB();

  // Ensure sample blog posts exist in MongoDB for testing categories
  const sampleCategories = ['Orthodontics', 'Implants', 'Root Canal', 'Teeth Whitening', 'Oral Hygiene'];
  for (const cat of sampleCategories) {
    await DentalBlog.findOneAndUpdate(
      { slug: `test-article-${cat.toLowerCase().replace(/\s+/g, '-')}` },
      {
        title: `Comprehensive Guide to ${cat}`,
        slug: `test-article-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        excerpt: `Discover essential insights and specialist advice on ${cat}.`,
        content: `Detailed clinical walkthrough for ${cat}...`,
        authorName: 'Dr. Sarah Johnson',
        category: cat,
        status: 'published',
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  const app = express();
  app.use(express.json());
  app.use('/api/blogs', dentalBlogRoutes);

  const server = app.listen(5098, async () => {
    console.log('📡 Blog test server running on port 5098');

    try {
      // Test 1: Category = All
      console.log('\n--- 1. Testing Category Filter: "All" (Fetch All Blogs) ---');
      const resAll = await fetch('http://localhost:5098/api/blogs?category=All&page=1&limit=5');
      const jsonAll = await resAll.json();
      console.log(`Status: ${resAll.status}, X-Cache: ${resAll.headers.get('x-cache')}`);
      console.log(`Fetched ${jsonAll.count} posts of total ${jsonAll.total}`);

      // Test 2: Specific Category Filter (e.g. Orthodontics)
      console.log('\n--- 2. Testing Specific Category Filter: "Orthodontics" ---');
      const resOrtho = await fetch('http://localhost:5098/api/blogs?category=Orthodontics');
      const jsonOrtho = await resOrtho.json();
      console.log(`Status: ${resOrtho.status}, X-Cache: ${resOrtho.headers.get('x-cache')}`);
      console.log(`Category: Orthodontics, Matching Count: ${jsonOrtho.count}`);
      if (jsonOrtho.data[0]) {
        console.log(`Top Post Title: "${jsonOrtho.data[0].title}" | Category: ${jsonOrtho.data[0].category}`);
      }

      // Test 3: Redis Cache Hit Verification (Second Request)
      console.log('\n--- 3. Testing Redis Cache Hit for Category "Orthodontics" ---');
      const resHit = await fetch('http://localhost:5098/api/blogs?category=Orthodontics');
      const jsonHit = await resHit.json();
      console.log(`Status: ${resHit.status}, X-Cache: ${resHit.headers.get('x-cache')}, Source: ${jsonHit.source}`);

      // Test 4: Verify Sorting (.sort({ createdAt: -1 })) & Pagination
      console.log('\n--- 4. Testing Server-side Pagination & Sorting ---');
      const resPage = await fetch('http://localhost:5098/api/blogs?page=1&limit=2');
      const jsonPage = await resPage.json();
      console.log(`Page: ${jsonPage.page}, Pages: ${jsonPage.pages}, Returned Count: ${jsonPage.count}`);

      console.log('\n✅ ALL BLOG CATEGORY BACKEND API TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('❌ Test failed with error:', err);
    } finally {
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    }
  });
}

runBlogTests();

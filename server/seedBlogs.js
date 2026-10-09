// seedBlogs.js — run: node server/seedBlogs.js (from project root)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import DentalBlog from './models/DentalBlog.js';

const blogs = [
  {
    title: '5 Tips for Maintaining Bright & Healthy Teeth',
    slug: '5-tips-for-maintaining-bright-healthy-teeth',
    excerpt: 'Discover the top dental hygiene habits that keep your smile dazzling and your gums healthy all year round.',
    content: `<p>Maintaining bright and healthy teeth doesn't require expensive treatments. A consistent daily routine is all you need. Here are five proven tips from our dental specialists at DentoCare.</p>
<h2>1. Brush Properly Twice a Day</h2>
<p>Use a soft-bristled brush and fluoride toothpaste. Brush for at least two minutes using gentle circular motions. Avoid brushing too hard — it erodes enamel.</p>
<h2>2. Floss Daily</h2>
<p>Flossing removes plaque and food particles that your toothbrush can't reach. Make it a non-negotiable part of your routine.</p>
<h2>3. Limit Staining Foods and Drinks</h2>
<p>Coffee, tea, red wine, and berries can stain enamel over time. Rinse your mouth with water after consuming them.</p>
<h2>4. Visit Your Dentist Every 6 Months</h2>
<p>Professional cleanings remove hardened tartar that home brushing can't. Early detection of issues saves time and money.</p>
<h2>5. Stay Hydrated</h2>
<p>Water washes away bacteria and food debris. Fluoridated tap water also strengthens tooth enamel.</p>`,
    category: 'Oral Hygiene',
    tags: ['brushing', 'teeth whitening', 'oral hygiene', 'dental tips'],
    status: 'published',
    authorName: 'Dr. Sarah Mitchell',
    authorRole: 'General Dentist',
    coverImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
    isFeatured: true,
    views: 1240,
    likes: 87,
    metaDescription: 'Top 5 dental tips to keep your teeth bright and healthy. Expert advice from DentoCare dental specialists.',
  },
  {
    title: 'Understanding the Importance of Regular Dental Checkups',
    slug: 'importance-of-regular-dental-checkups',
    excerpt: 'Regular checkups are the cornerstone of preventive dentistry. Learn why missing them can cost you more in the long run.',
    content: `<p>Many patients delay dental visits until pain forces them to come in. But preventive care is far more effective — and cheaper — than reactive treatment.</p>
<h2>What Happens During a Checkup?</h2>
<p>Your dentist will perform a comprehensive oral exam, check for cavities, assess gum health, screen for oral cancer, and take X-rays if needed. A hygienist will clean your teeth, removing plaque and tartar buildup.</p>
<h2>Early Detection Saves Teeth</h2>
<p>Cavities caught early require simple fillings. Left untreated, they can require root canals or extractions. Gum disease caught early is fully reversible; advanced periodontitis is not.</p>
<h2>How Often Should You Visit?</h2>
<p>The standard recommendation is every six months. However, patients with a history of gum disease, high cavity risk, or systemic conditions like diabetes may need visits every three to four months.</p>`,
    category: 'Patient Tips',
    tags: ['checkup', 'preventive dentistry', 'oral health', 'dental visit'],
    status: 'published',
    authorName: 'Dr. James Okoye',
    authorRole: 'Periodontist',
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffbb46b39c8?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 875,
    likes: 52,
    metaDescription: 'Why regular dental checkups are essential for your long-term oral health. Advice from DentoCare specialists.',
  },
  {
    title: 'How Laser Dentistry is Revolutionizing Treatment',
    slug: 'laser-dentistry-revolutionizing-treatment',
    excerpt: 'Laser technology is transforming the dental experience — less pain, faster healing, and more precise results.',
    content: `<p>If the thought of dental drills makes you anxious, laser dentistry may be the answer. This cutting-edge technology is changing how we treat cavities, gum disease, and more.</p>
<h2>What Is Laser Dentistry?</h2>
<p>Dental lasers deliver precise beams of light energy to cut, shape, or remove soft and hard tissues. They can be used for fillings, gum reshaping, teeth whitening, and treating infections.</p>
<h2>Benefits Over Traditional Methods</h2>
<ul>
  <li><strong>Less pain:</strong> Many procedures require little or no anesthesia.</li>
  <li><strong>Faster healing:</strong> Laser energy sterilizes the treatment area, reducing infection risk.</li>
  <li><strong>More precision:</strong> Healthy tissue surrounding the treatment area is preserved.</li>
  <li><strong>Reduced bleeding:</strong> Lasers cauterize as they cut, minimizing bleeding.</li>
</ul>
<h2>Common Laser Dental Procedures</h2>
<p>Cavity detection, gum disease treatment, crown lengthening, teeth whitening acceleration, and removal of benign oral tumors are all now performed with lasers at DentoCare.</p>`,
    category: 'Dental Technology',
    tags: ['laser dentistry', 'technology', 'pain-free dentistry', 'gum treatment'],
    status: 'published',
    authorName: 'Dr. Elena Vasquez',
    authorRole: 'Dental Surgeon',
    coverImage: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop',
    isFeatured: true,
    views: 2100,
    likes: 134,
    metaDescription: 'Explore how laser dentistry provides painless, precise, and faster dental treatments at DentoCare.',
  },
  {
    title: 'Everything You Need to Know About Dental Implants',
    slug: 'everything-about-dental-implants',
    excerpt: 'Dental implants are the gold standard for replacing missing teeth. Here is a complete guide to the procedure, costs, and recovery.',
    content: `<p>Losing a tooth can affect your confidence, bite alignment, and even bone density. Dental implants are the most natural-feeling and long-lasting solution available today.</p>
<h2>What Is a Dental Implant?</h2>
<p>An implant is a titanium post surgically placed into the jawbone. It fuses with the bone through a process called osseointegration, acting as an artificial tooth root. A crown is then attached on top.</p>
<h2>Who Is a Candidate?</h2>
<p>Ideal candidates have healthy gums and sufficient jawbone density. Smokers and patients with uncontrolled diabetes may face complications but can still be treated with proper management.</p>
<h2>The Implant Process</h2>
<ol>
  <li>Consultation and 3D imaging</li>
  <li>Implant placement surgery</li>
  <li>Healing period (3-6 months)</li>
  <li>Abutment placement</li>
  <li>Crown fitting</li>
</ol>`,
    category: 'Implants',
    tags: ['implants', 'missing teeth', 'oral surgery', 'restorative dentistry'],
    status: 'published',
    authorName: 'Dr. Michael Chen',
    authorRole: 'Oral Surgeon',
    coverImage: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 3450,
    likes: 210,
    metaDescription: 'Complete guide to dental implants: procedure, candidates, recovery, and costs. By DentoCare specialists.',
  },
  {
    title: 'Orthodontics for Adults: Is Braces at 30 Right for You?',
    slug: 'orthodontics-for-adults-braces-at-30',
    excerpt: 'Think braces are only for teenagers? Think again. More adults than ever are choosing orthodontic treatment — here\'s what you need to know.',
    content: `<p>Adult orthodontics has surged in popularity. With discreet options like clear aligners and ceramic braces, there is no age limit on achieving a straighter smile.</p>
<h2>Why Adults Seek Orthodontic Treatment</h2>
<p>Many adults had braces as teenagers but didn't wear their retainers, causing teeth to shift. Others never had treatment at all. Crooked teeth affect not just aesthetics but also bite function and gum health.</p>
<h2>Options for Adults</h2>
<ul>
  <li><strong>Traditional metal braces:</strong> Most effective for complex cases</li>
  <li><strong>Ceramic braces:</strong> Tooth-colored brackets for discretion</li>
  <li><strong>Clear aligners (Invisalign):</strong> Removable, nearly invisible trays</li>
  <li><strong>Lingual braces:</strong> Bonded to the back of teeth</li>
</ul>
<h2>How Long Does Treatment Take?</h2>
<p>Adult treatment typically takes 18-36 months depending on complexity. Clear aligners average 12-18 months for mild-to-moderate cases.</p>`,
    category: 'Orthodontics',
    tags: ['braces', 'aligners', 'orthodontics', 'adult treatment', 'Invisalign'],
    status: 'published',
    authorName: 'Dr. Priya Sharma',
    authorRole: 'Orthodontist',
    coverImage: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?q=80&w=800&auto=format&fit=crop',
    isFeatured: true,
    views: 1876,
    likes: 143,
    metaDescription: 'Adult orthodontics guide: braces and aligner options for adults at DentoCare. Is orthodontic treatment right for you?',
  },
  {
    title: 'Root Canal Therapy: Debunking the 5 Biggest Myths',
    slug: 'root-canal-therapy-debunking-myths',
    excerpt: 'Root canals have an undeserved bad reputation. Modern techniques make them no more uncomfortable than a standard filling.',
    content: `<p>Few dental procedures inspire as much dread as a root canal. But the reality of modern endodontic therapy is very different from its reputation.</p>
<h2>Myth 1: Root Canals Are Extremely Painful</h2>
<p>With today's local anesthesia and advanced techniques, most patients report that a root canal feels similar to getting a filling. The pain you feel before the procedure — from the infected tooth — is far worse than the treatment itself.</p>
<h2>Myth 2: It's Better to Just Pull the Tooth</h2>
<p>Preserving your natural tooth is always the preferred option. Missing teeth cause bone loss, shifting of adjacent teeth, and bite problems. Implants and bridges are costly replacements.</p>
<h2>Myth 3: Root Canals Cause Illness</h2>
<p>This myth stems from debunked 1920s research. Modern science has found no link between root canal treatment and systemic disease.</p>
<h2>Myth 4: Root Canals Remove the Tooth Roots</h2>
<p>A root canal removes only the infected pulp tissue inside the root canals, not the roots themselves. The tooth remains in place.</p>
<h2>Myth 5: You Only Need a Root Canal If You're in Pain</h2>
<p>Some infected teeth cause no pain at all. X-rays and pulp tests help dentists identify infection even in asymptomatic teeth.</p>`,
    category: 'Root Canal',
    tags: ['root canal', 'endodontics', 'tooth pain', 'infection', 'myths'],
    status: 'published',
    authorName: 'Dr. James Okoye',
    authorRole: 'Endodontist',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 4200,
    likes: 289,
    publishedAt: new Date('2026-06-12'),
    metaDescription: 'The truth about root canal therapy. DentoCare experts debunk 5 common root canal myths.',
  },
  {
    title: 'Veneers vs. Bonding: Choosing the Right Cosmetic Smile Upgrade',
    slug: 'veneers-vs-bonding-cosmetic-smile-upgrade',
    excerpt: 'From chips to discoloration, cosmetic dentistry can reshape your smile. Here is how to choose between porcelain veneers and composite bonding.',
    content: `<p>Cosmetic dentistry is about more than a brighter shade — it is about balance, proportion, and confidence. Two of the most requested options at DentoCare are porcelain veneers and composite bonding.</p>
<h2>Porcelain Veneers</h2>
<p>Thin ceramic shells are bonded to the front of teeth to correct color, shape, and small gaps. They are stain-resistant and can last 10–15 years with proper care.</p>
<h2>Composite Bonding</h2>
<p>Tooth-colored resin is sculpted in a single visit. Bonding is more affordable and conservative, though it may need touch-ups sooner than veneers.</p>
<h2>Which Is Right for You?</h2>
<p>If you want a dramatic, long-lasting transformation, veneers are often the better investment. For small chips or a modest shape change, bonding can deliver beautiful results with less enamel removal.</p>`,
    category: 'Cosmetic Dentistry',
    tags: ['veneers', 'bonding', 'smile makeover', 'cosmetic dentistry'],
    status: 'published',
    authorName: 'Dr. Elena Vasquez',
    authorRole: 'Cosmetic Dentist',
    coverImage: 'https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?q=80&w=800&auto=format&fit=crop',
    isFeatured: true,
    views: 1980,
    likes: 156,
    publishedAt: new Date('2026-07-02'),
    metaDescription: 'Compare porcelain veneers and composite bonding with DentoCare cosmetic dentistry specialists.',
  },
  {
    title: 'Making Dental Visits Fun: A Parent\'s Guide to Pediatric Care',
    slug: 'parents-guide-to-pediatric-dental-care',
    excerpt: 'Early dental habits last a lifetime. Learn how to prepare your child for checkups, prevent cavities, and keep appointments stress-free.',
    content: `<p>Pediatric dentistry focuses on growing smiles — baby teeth, mixed dentition, and the habits that protect adult teeth later on.</p>
<h2>When Should the First Visit Happen?</h2>
<p>The American Academy of Pediatric Dentistry recommends a first visit by age one, or within six months of the first tooth erupting.</p>
<h2>Cavity Prevention at Home</h2>
<p>Supervise brushing twice a day, limit sugary drinks, and consider fluoride varnish and dental sealants as your child grows.</p>
<h2>Easing Dental Anxiety</h2>
<p>Read a story about the dentist, avoid using the visit as a threat, and choose a practice that specializes in kid-friendly care. Positive first visits build trust for years to come.</p>`,
    category: 'Pediatric Dentistry',
    tags: ['kids dentistry', 'sealants', 'first dental visit', 'pediatric care'],
    status: 'published',
    authorName: 'Dr. Priya Sharma',
    authorRole: 'Pediatric Dentist',
    coverImage: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 1640,
    likes: 98,
    publishedAt: new Date('2026-05-20'),
    metaDescription: 'Pediatric dentistry tips for parents: first visits, cavity prevention, and anxiety-free checkups.',
  },
  {
    title: 'Professional Teeth Whitening: What Results to Expect',
    slug: 'professional-teeth-whitening-what-to-expect',
    excerpt: 'Over-the-counter strips can only go so far. See how in-office whitening works, who is a candidate, and how to keep your smile bright.',
    content: `<p>Professional teeth whitening uses higher-strength peroxide gels under dental supervision, producing faster and more even results than drugstore kits.</p>
<h2>In-Office vs. Take-Home Trays</h2>
<p>In-office treatments can lighten several shades in one visit. Custom take-home trays offer gradual whitening with less sensitivity for some patients.</p>
<h2>Who Should Wait?</h2>
<p>Whitening is less effective on crowns, veneers, or intrinsic stains. Pregnant patients and those with untreated decay or gum disease should complete restorative care first.</p>
<h2>Keeping Results Longer</h2>
<p>Avoid staining drinks for 48 hours after treatment, rinse after coffee or tea, and schedule touch-ups as advised by your dentist.</p>`,
    category: 'Teeth Whitening',
    tags: ['whitening', 'bleaching', 'cosmetic dentistry', 'smile'],
    status: 'published',
    authorName: 'Dr. Sarah Mitchell',
    authorRole: 'General Dentist',
    coverImage: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 2760,
    likes: 201,
    publishedAt: new Date('2026-08-08'),
    metaDescription: 'What to expect from professional teeth whitening at DentoCare, including results, sensitivity, and aftercare.',
  },
  {
    title: 'Early Signs of Gum Disease You Should Never Ignore',
    slug: 'early-signs-of-gum-disease',
    excerpt: 'Bleeding while brushing is not normal. Learn the warning signs of gingivitis and how periodontal care can reverse damage if you act early.',
    content: `<p>Gum disease is one of the most common oral health problems — and one of the most preventable when caught early.</p>
<h2>Gingivitis Warning Signs</h2>
<p>Red, swollen, or bleeding gums, persistent bad breath, and gums that recede from the teeth are early clues.</p>
<h2>What Happens If It Progresses</h2>
<p>Untreated gingivitis can become periodontitis, damaging the bone that holds teeth in place. Advanced cases may lead to tooth mobility or loss.</p>
<h2>Treatment Options</h2>
<p>Professional cleaning, scaling and root planing, improved home care, and in some cases laser therapy can restore gum health. Regular periodontal maintenance keeps disease from returning.</p>`,
    category: 'Gum Disease',
    tags: ['gingivitis', 'periodontitis', 'gum health', 'bleeding gums'],
    status: 'published',
    authorName: 'Dr. James Okoye',
    authorRole: 'Periodontist',
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffbb46b39c8?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 2210,
    likes: 167,
    publishedAt: new Date('2026-04-18'),
    metaDescription: 'Recognize early gum disease symptoms and learn how DentoCare treats gingivitis and periodontitis.',
  },
  {
    title: 'Your Complete Guide to a Healthy First Dental Year',
    slug: 'complete-guide-to-a-healthy-first-dental-year',
    excerpt: 'New to the practice or returning after a long break? This general dentistry checklist covers exams, cleanings, and everyday habits that protect your smile.',
    content: `<p>General dentistry is the foundation of every healthy smile. Whether you are a new patient or restarting care, a clear plan makes visits simpler.</p>
<h2>The Comprehensive Exam</h2>
<p>Your dentist reviews medical history, checks teeth and gums, screens for oral cancer, and takes X-rays when needed.</p>
<h2>A Cleaning You Can Feel</h2>
<p>Hygienists remove plaque and tartar, polish enamel, and offer personalized home-care coaching.</p>
<h2>A Year-Round Routine</h2>
<p>Brush twice daily with fluoride toothpaste, floss once a day, wear a night guard if you grind, and keep your six-month recare appointments.</p>`,
    category: 'General',
    tags: ['general dentistry', 'checkup', 'cleaning', 'oral health'],
    status: 'published',
    authorName: 'Dr. Sarah Mitchell',
    authorRole: 'General Dentist',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
    isFeatured: false,
    views: 980,
    likes: 64,
    publishedAt: new Date('2026-03-05'),
    metaDescription: 'A practical general dentistry guide for exams, cleanings, and daily oral health at DentoCare.',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');

    // Remove existing blog posts to avoid duplicates
    await DentalBlog.deleteMany({});
    console.log('🗑️  Cleared existing blogs');

    const inserted = await DentalBlog.insertMany(blogs);
    console.log(`✅ Inserted ${inserted.length} blog posts successfully`);

    inserted.forEach(b => console.log(`   • [${b.category}] ${b.title}`));

    await mongoose.disconnect();
    console.log('\n🎉 Blog seeding complete! Test:');
    console.log('   http://localhost:5000/api/articles');
    console.log('   http://localhost:5000/api/articles?category=Oral%20Hygiene');
    console.log('   http://localhost:5000/api/dental-blogs');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

/**
 * Seed script: populates Specialist, DentalBlog, and Billing collections
 * with realistic demo data.
 *
 * Usage (from project root):
 *   node server/seedSpecialists.js
 *
 * Usage (from server/ directory):
 *   node seedSpecialists.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server directory
dotenv.config({ path: join(__dirname, '.env') });

import Specialist from './models/Specialist.js';
import DentalBlog from './models/DentalBlog.js';
import Billing from './models/Billing.js';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const specialists = [
  {
    name: 'Dr. Adrian Thorne',
    slug: 'dr-adrian-thorne',
    email: 'adrian.thorne@dentocare.com',
    phone: '+1-512-301-0011',
    profileImage:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    specialization: 'Senior Orthodontist',
    degrees: [
      { degree: 'BDS', institution: 'Harvard School of Dental Medicine', passingYear: 2005 },
      { degree: 'MDS – Orthodontics', institution: 'Johns Hopkins University', passingYear: 2008 },
    ],
    experienceYears: 18,
    bio: 'Dr. Thorne is a board-certified orthodontist with 18+ years specialising in clear aligner therapy, lingual braces, and complex malocclusion corrections. He has published over 20 peer-reviewed papers on modern orthodontic biomechanics.',
    languages: ['English', 'French'],
    rating: 4.9,
    totalPatients: 3200,
    expertise: [
      'Clear Aligners (Invisalign)',
      'Ceramic Braces',
      'Lingual Braces',
      'Jaw Correction',
      'Retainer Fitting',
    ],
    chambers: [
      {
        name: 'DentoCare Main Clinic',
        address: '128 Wellness Avenue, Suite 4B',
        city: 'Austin, TX',
        phone: '+1-512-205-1826',
        schedule: 'Mon–Thu: 9 AM – 5 PM',
      },
      {
        name: 'North Austin Dental Centre',
        address: '45 Cedar Park Blvd',
        city: 'Austin, TX',
        phone: '+1-512-489-7712',
        schedule: 'Fri–Sat: 10 AM – 3 PM',
      },
    ],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    consultationFee: 150,
    telemedicineAvailable: true,
    telemedicineSlots: [
      { day: 'Monday', startTime: '06:00 PM', endTime: '08:00 PM' },
      { day: 'Wednesday', startTime: '06:00 PM', endTime: '08:00 PM' },
    ],
    telemedicineLink: 'https://meet.dentocare.com/dr-thorne',
    social: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    name: 'Dr. Eliana Vance',
    slug: 'dr-eliana-vance',
    email: 'eliana.vance@dentocare.com',
    phone: '+1-512-301-0022',
    profileImage:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
    specialization: 'Pediatric Dentist',
    degrees: [
      { degree: 'DDS', institution: 'University of Michigan School of Dentistry', passingYear: 2010 },
      { degree: 'MS – Pediatric Dentistry', institution: 'Boston University', passingYear: 2013 },
    ],
    experienceYears: 13,
    bio: 'Dr. Vance is passionate about creating positive dental experiences for children from infancy through adolescence. She uses behaviour-management techniques and child-friendly environments to eliminate dental anxiety.',
    languages: ['English', 'Spanish'],
    rating: 4.8,
    totalPatients: 2800,
    expertise: [
      'Infant Oral Health',
      'Space Maintainers',
      'Pit & Fissure Sealants',
      'Fluoride Treatments',
      'Child Orthodontic Assessment',
      'Sedation Dentistry for Kids',
    ],
    chambers: [
      {
        name: 'DentoCare Kids Wing',
        address: '128 Wellness Avenue, Suite 2A',
        city: 'Austin, TX',
        phone: '+1-512-205-1827',
        schedule: 'Mon, Wed, Fri: 9 AM – 4 PM',
      },
    ],
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    consultationFee: 120,
    telemedicineAvailable: true,
    telemedicineSlots: [
      { day: 'Tuesday', startTime: '07:00 PM', endTime: '09:00 PM' },
      { day: 'Thursday', startTime: '07:00 PM', endTime: '09:00 PM' },
    ],
    telemedicineLink: 'https://meet.dentocare.com/dr-vance',
    social: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    name: 'Dr. Marcus Sterling',
    slug: 'dr-marcus-sterling',
    email: 'marcus.sterling@dentocare.com',
    phone: '+1-512-301-0033',
    profileImage:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    specialization: 'Maxillofacial Surgeon',
    degrees: [
      { degree: 'BDS', institution: 'UCLA School of Dentistry', passingYear: 2003 },
      { degree: 'MD – Oral & Maxillofacial Surgery', institution: 'Stanford Medical School', passingYear: 2008 },
      { degree: 'FACS Fellowship', institution: 'American College of Surgeons', passingYear: 2010 },
    ],
    experienceYears: 21,
    bio: 'Dr. Sterling is a dual-qualified oral & maxillofacial surgeon with over two decades of experience in corrective jaw surgery, complex extractions, full-arch implant rehabilitation, and facial trauma reconstruction.',
    languages: ['English'],
    rating: 4.9,
    totalPatients: 1900,
    expertise: [
      'Dental Implants (All-on-4 / All-on-6)',
      'Corrective Jaw Surgery',
      'Wisdom Tooth Removal',
      'Bone Grafting',
      'Facial Trauma Repair',
      'TMJ Disorders',
      'Cleft Palate Surgery',
    ],
    chambers: [
      {
        name: 'DentoCare Surgical Suite',
        address: '128 Wellness Avenue, Suite 6C',
        city: 'Austin, TX',
        phone: '+1-512-205-1828',
        schedule: 'Tue, Thu: 8 AM – 3 PM',
      },
      {
        name: 'South Austin Medical Plaza',
        address: '200 S Congress Ave, Ste 310',
        city: 'Austin, TX',
        phone: '+1-512-555-9900',
        schedule: 'Wed: 10 AM – 2 PM',
      },
    ],
    availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
    consultationFee: 200,
    telemedicineAvailable: false,
    telemedicineSlots: [],
    social: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
  },
  {
    name: 'Dr. Sophia Reyes',
    slug: 'dr-sophia-reyes',
    email: 'sophia.reyes@dentocare.com',
    phone: '+1-512-301-0044',
    profileImage:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    specialization: 'Cosmetic & Restorative Dentist',
    degrees: [
      { degree: 'DMD', institution: 'Tufts University School of Dental Medicine', passingYear: 2011 },
      { degree: 'AACD Accreditation', institution: 'American Academy of Cosmetic Dentistry', passingYear: 2015 },
    ],
    experienceYears: 15,
    bio: 'Dr. Reyes combines artistry with precision dentistry to deliver smile makeovers, porcelain veneers, and full-mouth rehabilitations. She is one of only a handful of AACD-accredited cosmetic dentists in Texas.',
    languages: ['English', 'Spanish', 'Portuguese'],
    rating: 4.8,
    totalPatients: 2500,
    expertise: [
      'Porcelain Veneers',
      'Teeth Whitening',
      'Composite Bonding',
      'Dental Crowns & Bridges',
      'Smile Makeovers',
      'Gum Contouring',
    ],
    chambers: [
      {
        name: 'DentoCare Cosmetic Studio',
        address: '128 Wellness Avenue, Suite 3A',
        city: 'Austin, TX',
        phone: '+1-512-205-1829',
        schedule: 'Mon–Fri: 10 AM – 6 PM',
      },
    ],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 130,
    telemedicineAvailable: true,
    telemedicineSlots: [
      { day: 'Monday', startTime: '07:00 PM', endTime: '09:00 PM' },
      { day: 'Friday', startTime: '05:00 PM', endTime: '07:00 PM' },
    ],
    telemedicineLink: 'https://meet.dentocare.com/dr-reyes',
    social: {
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
    isActive: true,
    isFeatured: false,
    displayOrder: 4,
  },
  {
    name: 'Dr. Nathan Cross',
    slug: 'dr-nathan-cross',
    email: 'nathan.cross@dentocare.com',
    phone: '+1-512-301-0055',
    profileImage:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    specialization: 'Endodontist (Root Canal Specialist)',
    degrees: [
      { degree: 'BDS', institution: 'New York University College of Dentistry', passingYear: 2007 },
      { degree: 'MS – Endodontics', institution: 'University of Pennsylvania', passingYear: 2010 },
    ],
    experienceYears: 17,
    bio: 'Dr. Cross specialises in saving teeth through advanced root canal therapy, microscope-assisted retreatments, and apicoectomies. He is known for painless procedures and a near-zero reinfection rate.',
    languages: ['English', 'German'],
    rating: 4.7,
    totalPatients: 4100,
    expertise: [
      'Root Canal Therapy',
      'Microscopic Retreatment',
      'Apicoectomy',
      'Internal Bleaching',
      'Traumatic Dental Injuries',
      'Cracked Tooth Diagnosis',
    ],
    chambers: [
      {
        name: 'DentoCare Endodontic Suite',
        address: '128 Wellness Avenue, Suite 5B',
        city: 'Austin, TX',
        phone: '+1-512-205-1830',
        schedule: 'Mon–Fri: 9 AM – 4 PM',
      },
    ],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 140,
    telemedicineAvailable: true,
    telemedicineSlots: [
      { day: 'Wednesday', startTime: '08:00 PM', endTime: '09:30 PM' },
    ],
    telemedicineLink: 'https://meet.dentocare.com/dr-cross',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    isActive: true,
    isFeatured: false,
    displayOrder: 5,
  },
  {
    name: 'Dr. Priya Sharma',
    slug: 'dr-priya-sharma',
    email: 'priya.sharma@dentocare.com',
    phone: '+1-512-301-0066',
    profileImage:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=400&auto=format&fit=crop',
    specialization: 'Periodontist & Implantologist',
    degrees: [
      { degree: 'BDS', institution: 'University of Texas Health Science Center', passingYear: 2009 },
      { degree: 'MS – Periodontics', institution: 'Case Western Reserve University', passingYear: 2013 },
    ],
    experienceYears: 15,
    bio: 'Dr. Sharma is an expert in gum disease management, laser periodontal therapy, and implant placement. Her holistic approach connects systemic health with oral health for long-term wellness outcomes.',
    languages: ['English', 'Hindi', 'Punjabi'],
    rating: 4.8,
    totalPatients: 2100,
    expertise: [
      'Laser Gum Treatment',
      'Scaling & Root Planing',
      'Gum Grafting',
      'Osseous Surgery',
      'Dental Implant Placement',
      'Bone Regeneration',
    ],
    chambers: [
      {
        name: 'DentoCare Periodontic Centre',
        address: '128 Wellness Avenue, Suite 7A',
        city: 'Austin, TX',
        phone: '+1-512-205-1831',
        schedule: 'Tue–Sat: 9 AM – 5 PM',
      },
    ],
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    consultationFee: 160,
    telemedicineAvailable: true,
    telemedicineSlots: [
      { day: 'Tuesday', startTime: '06:30 PM', endTime: '08:00 PM' },
      { day: 'Saturday', startTime: '12:00 PM', endTime: '02:00 PM' },
    ],
    telemedicineLink: 'https://meet.dentocare.com/dr-sharma',
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
    isActive: true,
    isFeatured: false,
    displayOrder: 6,
  },
];

const blogs = [
  {
    title: 'Why Early Orthodontic Treatment Matters for Children',
    slug: 'early-orthodontic-treatment-children',
    excerpt:
      'Starting orthodontic evaluation at age 7 can catch problems before they become expensive, complex corrections. Here\'s what every parent needs to know.',
    content: `<p>The American Association of Orthodontists recommends that children receive their first orthodontic evaluation by age 7. At this stage, the jaw is still developing, giving orthodontists a critical window to guide growth and prevent more serious issues later on.</p><h3>What Can Be Detected Early?</h3><p>Crossbites, underbites, crowding, and spacing issues are all far easier to treat when the jawbone is still malleable. Phase 1 treatment (interceptive orthodontics) uses simple appliances to create space and guide erupting permanent teeth into better positions.</p><h3>Benefits of Early Treatment</h3><ul><li>Shorter overall treatment time</li><li>Reduced need for tooth extractions</li><li>Lower cost compared to adult correction</li><li>Improved self-confidence during school years</li></ul><p>Talk to Dr. Thorne today about scheduling an orthodontic screening for your child.</p>`,
    authorName: 'Dr. Adrian Thorne',
    authorRole: 'Senior Orthodontist',
    authorImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
    category: 'Orthodontics',
    tags: ['children', 'braces', 'early treatment', 'jaw development'],
    status: 'published',
    isFeatured: true,
    views: 342,
    likes: 28,
  },
  {
    title: 'The Complete Guide to Dental Implants in 2026',
    slug: 'complete-guide-dental-implants-2026',
    excerpt:
      'Dental implants have become the gold standard for tooth replacement. We break down everything — from candidacy to recovery — in plain language.',
    content: `<p>A dental implant is a titanium post surgically placed in the jawbone to act as an artificial tooth root. Once integrated (a process called osseointegration taking 3–6 months), a custom crown is attached on top, creating a restoration that looks, feels, and functions like a natural tooth.</p><h3>Am I a Candidate?</h3><p>Most adults with good general health and sufficient bone density are candidates. Conditions like uncontrolled diabetes or active gum disease need to be addressed first. Dr. Sterling will perform a CBCT scan to assess your bone volume and plan the precise implant position.</p><h3>The Procedure Step-by-Step</h3><ol><li><strong>Consultation & Imaging:</strong> CBCT scan, treatment planning</li><li><strong>Extraction (if needed):</strong> Socket preservation with bone graft</li><li><strong>Implant Placement:</strong> Outpatient surgical procedure under local anaesthesia</li><li><strong>Healing Period:</strong> 3–6 months for osseointegration</li><li><strong>Crown Placement:</strong> Custom-fabricated porcelain crown</li></ol><h3>All-on-4 vs Individual Implants</h3><p>For patients missing all or most teeth, the All-on-4 protocol uses only four implants to support a full arch of fixed teeth — dramatically reducing cost and healing time compared to individual implants for each tooth.</p>`,
    authorName: 'Dr. Marcus Sterling',
    authorRole: 'Maxillofacial Surgeon',
    authorImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
    category: 'Implants',
    tags: ['implants', 'tooth replacement', 'All-on-4', 'osseointegration'],
    status: 'published',
    isFeatured: true,
    views: 891,
    likes: 67,
  },
  {
    title: '10 Tips to Beat Dental Anxiety in Children',
    slug: '10-tips-dental-anxiety-children',
    excerpt:
      'Does your child dread dental visits? Dr. Vance shares evidence-based strategies to make every appointment calm, positive, and even fun.',
    content: `<p>Dental anxiety affects up to 20% of children and, if left unaddressed, can lead to avoidance that persists into adulthood. The good news: with the right approach, most children can learn to feel safe and comfortable in the dental chair.</p><h3>10 Practical Strategies</h3><ol><li><strong>Start Early:</strong> First visit by age 1, even before teeth fully erupt, builds familiarity.</li><li><strong>Use Positive Language:</strong> Avoid words like "needle," "drill," or "hurt." Say "sleepy juice" and "tickle brush" instead.</li><li><strong>Tell-Show-Do:</strong> Demonstrate every instrument before touching the child.</li><li><strong>Distraction:</strong> Ceiling-mounted TVs, noise-cancelling headphones, and stress balls work wonders.</li><li><strong>Nitrous Oxide:</strong> Safe, reversible, and highly effective for mild–moderate anxiety.</li><li><strong>Praise & Reward:</strong> Sticker charts and small prizes reinforce brave behaviour.</li><li><strong>Parent Coaching:</strong> Anxious parents transmit anxiety — stay calm and positive.</li><li><strong>Short Appointments:</strong> Build tolerance gradually with brief, low-stress visits first.</li><li><strong>Child-Centred Environment:</strong> Bright murals, toys, and kid-friendly music reduce stress.</li><li><strong>Involve the Child:</strong> Let them hold a mirror or choose the toothpaste flavour.</li></ol>`,
    authorName: 'Dr. Eliana Vance',
    authorRole: 'Pediatric Dentist',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    category: 'Pediatric Dentistry',
    tags: ['children', 'anxiety', 'sedation', 'pediatric'],
    status: 'published',
    isFeatured: false,
    views: 554,
    likes: 43,
  },
  {
    title: 'Root Canal Therapy: Myths vs. Reality',
    slug: 'root-canal-myths-vs-reality',
    excerpt:
      'Root canals have an undeserved reputation for being painful. Dr. Cross sets the record straight with modern facts about this tooth-saving treatment.',
    content: `<p>"I'd rather have a root canal" has become a cultural shorthand for something terrible. But modern endodontic therapy is routine, highly effective, and — thanks to advanced anaesthesia and rotary instrumentation — comparable in discomfort to having a simple filling placed.</p><h3>Myth 1: Root Canals Are Extremely Painful</h3><p><strong>Reality:</strong> The <em>infection</em> causing the abscess is what's painful. Root canal therapy eliminates that infection and the pain along with it.</p><h3>Myth 2: It's Better to Extract the Tooth</h3><p><strong>Reality:</strong> Natural teeth have no true substitute. Saving your tooth preserves jaw bone, bite function, and avoids the cost cascade of implants or bridges.</p><h3>Myth 3: Root Canals Cause Illness</h3><p><strong>Reality:</strong> This myth traces back to poorly designed 1920s research. Modern studies consistently show root canal treatment does not cause systemic disease.</p><h3>What to Expect</h3><p>Treatment takes 1–2 appointments. The area is numbed, the pulp removed, the canals shaped and disinfected, then sealed with biocompatible gutta-percha. A crown is placed afterward to protect the tooth long-term.</p>`,
    authorName: 'Dr. Nathan Cross',
    authorRole: 'Endodontist',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=800&auto=format&fit=crop',
    category: 'Root Canal',
    tags: ['root canal', 'endodontics', 'myths', 'pain'],
    status: 'published',
    isFeatured: false,
    views: 712,
    likes: 55,
  },
  {
    title: 'Porcelain Veneers: Are They Right for You?',
    slug: 'porcelain-veneers-are-they-right-for-you',
    excerpt:
      'Veneers can transform your smile in as little as two appointments. Dr. Reyes explains candidacy, the procedure, and what to realistically expect.',
    content: `<p>Porcelain veneers are ultra-thin ceramic shells bonded to the front surface of teeth to correct colour, shape, length, or spacing. They're a cornerstone of cosmetic dentistry and can produce dramatic, lasting results.</p><h3>Good Candidates for Veneers</h3><ul><li>Permanently stained or discoloured teeth (resistant to whitening)</li><li>Chipped, cracked, or mildly misaligned teeth</li><li>Gaps or minor spacing issues</li><li>Teeth that appear too short or uneven</li></ul><h3>The Procedure</h3><p>After a detailed digital smile design consultation, a thin layer of enamel (0.3–0.5 mm) is removed to accommodate the veneer. Temporaries are placed while your custom porcelain shells are fabricated in our partnered lab. At the second visit, veneers are permanently bonded with light-cured composite.</p><h3>How Long Do They Last?</h3><p>With proper care, porcelain veneers last 10–20 years. Avoid biting nails, chewing ice, or using teeth as tools. A night guard is recommended if you grind.</p>`,
    authorName: 'Dr. Sophia Reyes',
    authorRole: 'Cosmetic & Restorative Dentist',
    authorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
    category: 'Cosmetic Dentistry',
    tags: ['veneers', 'smile makeover', 'cosmetic', 'porcelain'],
    status: 'published',
    isFeatured: false,
    views: 489,
    likes: 38,
  },
  {
    title: 'The Link Between Gum Disease and Heart Health',
    slug: 'gum-disease-heart-health-connection',
    excerpt:
      'Growing evidence links periodontal disease with increased risk of heart attack and stroke. Dr. Sharma explains the systemic connection and what you can do.',
    content: `<p>Periodontal (gum) disease is not just a mouth problem. Research published in the Journal of the American Heart Association and other major publications has established a significant association between chronic gum inflammation and cardiovascular disease.</p><h3>The Mechanism</h3><p>When bacteria from infected gum tissue enter the bloodstream, they can trigger inflammatory responses throughout the body. This contributes to the formation of arterial plaques, raising the risk of heart attack and stroke.</p><h3>The Numbers</h3><ul><li>People with periodontitis are <strong>2–3 times more likely</strong> to have a heart attack</li><li>Treating gum disease has been shown to improve blood vessel function within 6 months</li><li>Diabetic patients with controlled gum disease show measurably better HbA1c levels</li></ul><h3>What You Should Do</h3><p>Professional cleanings every 6 months, daily flossing, and early treatment of any gum inflammation are your frontline defences — not just for your mouth, but for your heart as well.</p>`,
    authorName: 'Dr. Priya Sharma',
    authorRole: 'Periodontist & Implantologist',
    authorImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=100&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
    category: 'Gum Disease',
    tags: ['gum disease', 'heart health', 'periodontitis', 'systemic health'],
    status: 'published',
    isFeatured: false,
    views: 623,
    likes: 51,
  },
];

const billingFees = [
  {
    patientName: 'Demo Patient A',
    patientId: 'PAT-DEMO1',
    specialistName: 'Dr. Adrian Thorne',
    items: [{ procedure: 'Orthodontic Braces (Full)', unitPrice: 45000, quantity: 1, discount: 0 }],
    paymentStatus: 'paid',
    paymentMethod: 'card',
    paidAmount: 45000,
    invoiceDate: new Date('2026-06-15'),
  },
  {
    patientName: 'Demo Patient B',
    patientId: 'PAT-DEMO2',
    specialistName: 'Dr. Marcus Sterling',
    items: [
      { procedure: 'Dental Implant', unitPrice: 25000, quantity: 1, discount: 0 },
      { procedure: 'Bone Grafting', unitPrice: 8000, quantity: 1, discount: 10 },
    ],
    paymentStatus: 'partial',
    paymentMethod: 'bank_transfer',
    paidAmount: 20000,
    invoiceDate: new Date('2026-07-02'),
  },
  {
    patientName: 'Demo Patient C',
    patientId: 'PAT-DEMO3',
    specialistName: 'Dr. Nathan Cross',
    items: [{ procedure: 'Root Canal Treatment', unitPrice: 8000, quantity: 1, discount: 0 }],
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    paidAmount: 0,
    invoiceDate: new Date('2026-08-20'),
  },
];

// ─── Seed Runner ──────────────────────────────────────────────────────────────

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentist_db';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ MongoDB connected');

    // Clear existing seed data
    await Specialist.deleteMany({});
    await DentalBlog.deleteMany({});
    await Billing.deleteMany({});
    console.log('🗑️  Cleared existing Specialists, DentalBlogs, Billing');

    // Insert specialists
    const insertedSpecialists = await Specialist.insertMany(specialists);
    console.log(`👨‍⚕️  Seeded ${insertedSpecialists.length} specialists`);

    // Attach authorId refs to blogs from inserted specialists
    const blogsWithRefs = blogs.map((blog) => {
      const match = insertedSpecialists.find((s) => s.name === blog.authorName);
      return { ...blog, authorId: match ? match._id : null };
    });

    const insertedBlogs = await DentalBlog.insertMany(blogsWithRefs);
    console.log(`📝  Seeded ${insertedBlogs.length} dental blog articles`);

    // Attach specialistId refs to billing
    const billingWithRefs = billingFees.map((inv) => {
      const match = insertedSpecialists.find((s) => s.name === inv.specialistName);
      return { ...inv, specialistId: match ? match._id : null };
    });

    const insertedBilling = await Billing.insertMany(billingWithRefs);
    console.log(`💳  Seeded ${insertedBilling.length} billing invoices`);

    console.log('\n🎉 Seed complete! Disconnect and exiting...');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();

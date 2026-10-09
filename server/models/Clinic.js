import mongoose from 'mongoose';

export const DEFAULT_CLINIC = {
  name: 'DentoCare Dental Clinic',
  clinicHistory:
    'Founded in 2012, DentoCare Dental Clinic has provided world-class oral healthcare and advanced dental treatments to over 25,000 patients. Our clinic integrates cutting-edge dental tech with personalized therapies to build brilliant smiles.',
  description:
    'Our clinic integrates cutting-edge dental tech with personalized therapies to build brilliant smiles. From diagnostic analysis to full reconstructive oral aesthetics, we prioritize your long-term wellness in a calm, modern environment.',
  bannerImage:
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop',
  doctorProfiles: [
    {
      name: 'Dr. Sarah Johnson',
      designation: 'Chief Orthodontist & Dental Surgeon',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
      bio: 'Over 14 years of clinical experience in smile design, orthodontic treatments, and Invisalign solutions.',
    },
    {
      name: 'Dr. Michael Chen',
      designation: 'Senior Periodontist & Implant Specialist',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
      bio: 'Expert in dental implants, gum disease treatment, and restorative cosmetic oral surgery.',
    },
  ],
  labImages: [
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
  ],
  workingHours: {
    monday: '9:00 AM – 8:00 PM',
    tuesday: '9:00 AM – 8:00 PM',
    wednesday: '9:00 AM – 8:00 PM',
    thursday: '9:00 AM – 8:00 PM',
    friday: '2:00 PM – 8:00 PM',
    saturday: '9:00 AM – 8:00 PM',
    sunday: 'Closed',
    summary: 'Sat–Thu: 9:00 AM – 8:00 PM · Fri: 2:00 PM – 8:00 PM',
  },
  facilities: [
    'Advanced 3D Oral CT & Digital X-Ray',
    'Pain-Free Laser Therapy & Whitening',
    'Class-B Autoclave Sterilization Room',
    'Ultra-HD Intraoral Diagnostic Cameras',
    'Comfortable Pediatric Care Lounge',
    'In-House CAD/CAM Dental Prosthetics Lab',
  ],
  features: [
    'Advanced Oral Diagnostics',
    'Pain-Free Laser Treatments',
    'Aesthetic Smile Designing',
    'Sterilized Global Standards',
    'Digital X-Ray & 3D Imaging',
    'Same-Day Emergency Care',
  ],
  address: '123 Dental Street, Suite 400, Austin, TX 78701',
  phone: '+1 (512) 205-1826',
  email: 'hello@dentocare.com',
};

const doctorProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const clinicSchema = new mongoose.Schema(
  {
    clinicHistory: {
      type: String,
      default: DEFAULT_CLINIC.clinicHistory,
      trim: true,
    },
    doctorProfiles: {
      type: [doctorProfileSchema],
      default: DEFAULT_CLINIC.doctorProfiles,
    },
    labImages: {
      type: [String],
      default: DEFAULT_CLINIC.labImages,
    },
    workingHours: {
      type: mongoose.Schema.Types.Mixed,
      default: DEFAULT_CLINIC.workingHours,
    },
    facilities: {
      type: [String],
      default: DEFAULT_CLINIC.facilities,
    },
    name: {
      type: String,
      default: DEFAULT_CLINIC.name,
      trim: true,
    },
    description: {
      type: String,
      default: DEFAULT_CLINIC.description,
      trim: true,
    },
    bannerImage: {
      type: String,
      default: DEFAULT_CLINIC.bannerImage,
      trim: true,
    },
    features: {
      type: [String],
      default: DEFAULT_CLINIC.features,
    },
    address: {
      type: String,
      default: DEFAULT_CLINIC.address,
      trim: true,
    },
    phone: {
      type: String,
      default: DEFAULT_CLINIC.phone,
      trim: true,
    },
    email: {
      type: String,
      default: DEFAULT_CLINIC.email,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Clinic = mongoose.model('Clinic', clinicSchema);
export default Clinic;

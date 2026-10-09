import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['Teeth Whitening', 'Dental Implants', 'Braces', 'Veneers', 'General'],
    required: true 
  },
  imageUrl: { type: String, required: true },
  // Metadata Linking (Privacy: Do NOT store sensitive patient data here)
  patientCaseId: { type: String, required: true }, 
  doctorName: { type: String, required: true },
  
  // Content Management: Approval System
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Gallery = mongoose.model('Gallery', gallerySchema);

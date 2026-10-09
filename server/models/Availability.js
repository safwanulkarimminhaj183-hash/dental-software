import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  timeSlots: { 
    type: [String], 
    required: true,
    default: []
  },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;

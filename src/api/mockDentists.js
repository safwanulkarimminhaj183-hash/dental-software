// Mock specialist data
export const dentistsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Orthodontist",
    qualifications: "BDS, MDS (Orthodontics)",
    experience_years: 12,
    image_url: "/placeholder-doctor.jpg",
    bio: "Dr. Sarah has over 12 years of experience in straightening teeth and correcting bite issues using advanced orthodontic techniques.",
    availability_schedule: "Mon-Fri, 9am-5pm",
    chamber_location: "Main Clinic, Room 101",
    contact_email: "sarah.johnson@dentocare.com"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Pediatric Dentist",
    qualifications: "BDS, PGD (Pediatric Dentistry)",
    experience_years: 8,
    image_url: "/placeholder-doctor.jpg",
    bio: "Dedicated to providing gentle and effective dental care for children of all ages.",
    availability_schedule: "Tue-Sat, 10am-6pm",
    chamber_location: "Pediatric Wing, Room 202",
    contact_email: "michael.chen@dentocare.com"
  }
];

export const getDentists = () => dentistsData;
export const getDentistById = (id) => dentistsData.find(d => d.id === parseInt(id));

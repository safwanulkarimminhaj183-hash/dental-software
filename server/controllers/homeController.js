import Service from '../models/Service.js';
import User from '../models/User.js';
// We'll use mock testimonials if no Review model exists, as requested by dynamic layout.

/**
 * @desc    Fetch layout-specific data for Home 1 (Patients Homepage)
 * @route   GET /api/home1/hero
 * @access  Public
 */
export const getHome1Hero = async (req, res) => {
  try {
    // 1. Fetch Banner/Hero Content (Mocking layout-specific data stored in DB)
    const heroContent = {
      title: 'Let Us Brighten Your Smile',
      subtitle: 'WE USE LATEST MEDICAL TECHNOLOGY',
      ctaText: 'Who We Are',
      images: ['/assets/dentist-picture.jpg'], 
    };

    // 2. Fetch Service List (Dental Treatments)
    // Find active services or just fallback to generic list if empty
    const services = await Service.find({ isActive: true }).select('name description icon price').limit(6);

    // 3. Fetch Doctor Profiles
    // Doctors are users with role = 'doctor'
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name specialization profilePhoto')
      .limit(4);

    // 4. Fetch Testimonials / Reviews (Mocked if no collection exists)
    const testimonials = [
      {
        patientName: 'Sarah Jenkins',
        rating: 5,
        review: 'Absolutely wonderful experience. The staff was incredibly friendly and the clinic is spotless.',
      },
      {
        patientName: 'Michael Chen',
        rating: 5,
        review: 'I had a root canal done and felt almost no pain. Highly recommend Dr. Johnson!',
      },
    ];

    return res.status(200).json({
      success: true,
      layout: 'Home 1 - Patient Focus',
      data: {
        hero: heroContent,
        services: services.length > 0 ? services : [
          { name: 'Teeth Whitening', description: 'Professional teeth whitening service.' },
          { name: 'Root Canal', description: 'Painless root canal therapy.' },
        ],
        doctors,
        testimonials,
      },
    });
  } catch (error) {
    console.error('Error fetching Home 1 data:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching Home 1 layout' });
  }
};

/**
 * @desc    Fetch layout-specific data for Home 2 (Dentist/Admin Focus)
 * @route   GET /api/home2/features
 * @access  Public (or protected if strictly internal)
 */
export const getHome2Features = async (req, res) => {
  try {
    // 1. Fetch Hero / Features Content
    const featuresContent = {
      title: 'Let Us Craft Your Ideal Smile',
      subtitle: 'PRECISE & MODERN DENTAL CARE',
      ctaText: 'OUR APPROACH',
      offers: [
        { title: 'Free Consultation', description: 'For first-time child patients.' },
        { title: '15% Off Whitening', description: 'Valid until the end of this month.' },
      ],
      clinicStats: {
        patientsServed: 12500,
        successRate: '99%',
        expertDoctors: 15,
        yearsExperience: 10,
      }
    };

    // This layout focuses heavily on distinctive features and internal stats
    const distinctiveFeatures = [
      { title: 'Oral Orthodontics', description: 'Clear aligners and traditional braces.' },
      { title: "Children's Care", description: 'Happy dental experiences for kids.' },
      { title: 'Restorative Solutions', description: 'Durable fillings, crowns, and root canal therapy.' }
    ];

    return res.status(200).json({
      success: true,
      layout: 'Home 2 - Clinic Features & Offers',
      data: {
        hero: {
          title: featuresContent.title,
          subtitle: featuresContent.subtitle,
          ctaText: featuresContent.ctaText,
        },
        promotionalOffers: featuresContent.offers,
        statistics: featuresContent.clinicStats,
        features: distinctiveFeatures,
      },
    });
  } catch (error) {
    console.error('Error fetching Home 2 data:', error);
    return res.status(500).json({ success: false, message: 'Server Error fetching Home 2 layout' });
  }
};

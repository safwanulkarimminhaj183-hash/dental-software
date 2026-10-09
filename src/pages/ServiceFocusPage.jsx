import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Clock, DollarSign } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const ServiceFocusPage = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/service-focus/categories`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        setCategories(['All', ...list]);
      } else {
        setCategories(['All', 'General', 'Cosmetic', 'Orthodontics', 'Surgery']);
      }
    } catch (err) {
      setCategories(['All', 'General', 'Cosmetic', 'Orthodontics', 'Surgery']);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const url = activeCategory === 'All'
        ? `${API_BASE}/api/service-focus`
        : `${API_BASE}/api/service-focus?category=${activeCategory}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch services');
      const response = await res.json();
      const data = response.data || [];
      setServices(data);
    } catch (err) {
      // Fallback data to ensure content always displays
      const fallbackServices = [
        {
          _id: '1',
          name: 'Laser Teeth Whitening',
          category: 'Cosmetic Dentistry',
          shortDescription: 'Advanced dual-wavelength laser whitening delivering up to 8 shades lighter in a single session.',
          durationMinutes: 60,
          basePrice: 280,
        },
        {
          _id: '2',
          name: 'Smile Enhancement & Cosmetic Dentistry',
          category: 'Cosmetic Dentistry',
          shortDescription: 'Comprehensive cosmetic smile design incorporating porcelain veneers, reshaping, and shade matching.',
          durationMinutes: 90,
          basePrice: 650,
        },
        {
          _id: '3',
          name: 'Root Canal Therapy',
          category: 'Endodontics',
          shortDescription: 'Gentle, pain-relieving endodontic therapy with advanced micro-rotary files and 3D apex locator.',
          durationMinutes: 60,
          basePrice: 450,
        },
        {
          _id: '4',
          name: 'Permanent Dental Implants',
          category: 'Implantology',
          shortDescription: 'State-of-the-art titanium and zirconia implant restorations offering lifetime tooth replacement.',
          durationMinutes: 90,
          basePrice: 1200,
        },
        {
          _id: '5',
          name: 'Pediatric Dental Care',
          category: 'Pediatric Dentistry',
          shortDescription: 'Gentle, friendly, and fear-free dental care tailored specifically for infants, children, and teens.',
          durationMinutes: 45,
          basePrice: 180,
        },
        {
          _id: '6',
          name: 'Orthodontic Braces',
          category: 'Orthodontics',
          shortDescription: 'Clear aesthetic ceramic braces for straightening teeth and correcting bite issues.',
          durationMinutes: 60,
          basePrice: 350,
        },
        {
          _id: '7',
          name: 'Oral Surgery',
          category: 'Oral Surgery',
          shortDescription: 'Professional tooth extractions and surgical procedures with minimal discomfort.',
          durationMinutes: 45,
          basePrice: 200,
        },
        {
          _id: '8',
          name: 'General Dentistry',
          category: 'General Dentistry',
          shortDescription: 'Comprehensive dental checkups, cleanings, and preventive care for healthy smiles.',
          durationMinutes: 30,
          basePrice: 100,
        },
      ];

      // Filter by category
      const filtered = activeCategory === 'All'
        ? fallbackServices
        : fallbackServices.filter(s => s.category.includes(activeCategory));

      setServices(filtered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Simple Header */}
        <section className="bg-[#0e2a47] text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Dental Services</h1>
            <p className="text-gray-300">Choose a category to view available treatments</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-lg font-medium transition-colors ${activeCategory === cat ? 'bg-[#3ec1d3] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3ec1d3]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service._id || service.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-5"
                    >
                      <div className="inline-block px-2 py-1 bg-[#f0f9fa] text-[#3ec1d3] text-xs font-semibold rounded mb-3">
                        {service.category}
                      </div>
                      <h3 className="text-lg font-bold text-[#0e2a47] mb-2">{service.name}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.shortDescription || service.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center text-gray-600 text-sm gap-1">
                          <Clock className="w-4 h-4 text-gray-400" /> {service.durationMinutes ? `${service.durationMinutes} mins` : service.duration}
                        </div>
                        <div className="flex items-center text-[#0e2a47] font-bold text-sm gap-1">
                          <DollarSign className="w-4 h-4 text-[#3ec1d3]" /> {service.basePrice ? `$${service.basePrice}` : service.price}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No services found in this category.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceFocusPage;
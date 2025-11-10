import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getDefaultServiceImage = (category) => {
    const defaultImages = {
      'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop',
      'Carpentry': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
      'Cleaning': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop',
      'Gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      'Appliance Repair': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'Painting': 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=300&fit=crop',
      'HVAC': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop';
  };

  const categories = [
    'All Categories',
    'Electrical',
    'Plumbing', 
    'Carpentry',
    'Appliance Repair',
    'Cleaning',
    'Gardening',
    'Painting',
    'HVAC'
  ];

  // Fetch services from API
  useEffect(() => {
    fetchServices();
  }, []);

  // Navigation handlers
  const handleBookNow = (serviceId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${serviceId}`);
  };

  const handleViewDetails = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  // Refetch when filters change
  useEffect(() => {
    if (searchTerm || selectedCategory !== '' || location) {
      const timer = setTimeout(() => {
        fetchServicesWithFilters();
      }, 500); // Debounce API calls
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedCategory, location]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllServices();
      console.log('Services API response:', response.data);
      
      // Check if response has content property (paginated response)
      const servicesData = response.data.content || response.data;
      setServices(servicesData);
      setError('');
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesWithFilters = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (location) params.location = location;
      
      const response = await apiService.getAllServices(params);
      console.log('Filtered services API response:', response.data);
      
      const servicesData = response.data.content || response.data;
      setServices(servicesData);
      setError('');
    } catch (error) {
      console.error('Error fetching filtered services:', error);
      setError('Failed to load services. Please try again later.');
    }
  };

  // Mock services data - fallback for development
  const mockServices = [
    {
      id: 1,
      title: 'Professional Electrical Services',
      provider: 'John Smith',
      category: 'Electrical',
      price: 75,
      rating: 4.8,
      reviews: 24,
      location: 'Downtown',
      image: 'https://via.placeholder.com/300x200',
      description: 'Licensed electrician with 10+ years experience'
    },
    {
      id: 2,
      title: 'Expert Plumbing Solutions',
      provider: 'Mike Johnson',
      category: 'Plumbing',
      price: 80,
      rating: 4.9,
      reviews: 31,
      location: 'Midtown',
      image: 'https://via.placeholder.com/300x200',
      description: 'Emergency plumbing services available 24/7'
    },
    {
      id: 3,
      title: 'Custom Carpentry Work',
      provider: 'Sarah Wilson',
      category: 'Carpentry',
      price: 65,
      rating: 4.7,
      reviews: 18,
      location: 'Uptown',
      image: 'https://via.placeholder.com/300x200',
      description: 'Custom furniture and home improvement projects'
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.provider?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All Categories' || 
                           service.category === selectedCategory;
    const matchesLocation = location === '' || 
                           service.location.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Services</h1>
        <p className="text-gray-600">Discover trusted service providers in your area</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Services
            </label>
            <input
              type="text"
              id="search"
              className="input-field"
              placeholder="Search by service or provider name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="input-field"
              placeholder="Enter your area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Loading services...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchServices}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Services Grid */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div key={service.id} className="card hover:shadow-lg transition-shadow duration-200">
                <img
                  src={service.serviceImages || service.imageUrl || getDefaultServiceImage(service.category)}
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = getDefaultServiceImage(service.category);
                  }}
                />
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {service.title}
                    </h3>
                    <span className="text-lg font-bold text-primary-600">
                      ₹{service.price}/hr
                    </span>
                  </div>
                  
                  <p className="text-gray-600">by {service.provider?.name || 'Provider'}</p>
                  <p className="text-sm text-gray-500">{service.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {service.category}
                      </span>
                      {service.subcategory && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {service.subcategory}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">📍 {service.location}</span>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <button 
                      className="btn-primary w-full"
                      onClick={() => handleBookNow(service.id)}
                    >
                      Book Now
                    </button>
                    <button 
                      className="btn-outline w-full"
                      onClick={() => handleViewDetails(service.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {filteredServices.length > 0 && (
        <div className="text-center mt-8">
          <button className="btn-outline">Load More Services</button>
        </div>
      )}
    </div>
  );
};

export default Services;
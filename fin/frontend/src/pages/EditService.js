import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import LocationSelector from '../components/LocationSelector';

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, canCreateServices } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    location: '',
    latitude: null,
    longitude: null,
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '17:00', available: false },
      sunday: { start: '09:00', end: '17:00', available: false }
    }
  });

  const categories = {
    'Electrical': ['Wiring', 'Lighting', 'Panel Upgrades', 'Outlets', 'Ceiling Fans'],
    'Plumbing': ['Pipe Repair', 'Drain Cleaning', 'Water Heater', 'Toilet Repair', 'Faucet Installation'],
    'Carpentry': ['Custom Furniture', 'Door Installation', 'Shelving', 'Deck Building', 'Trim Work'],
    'Appliance Repair': ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Oven'],
    'Cleaning': ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning', 'Move-out Cleaning'],
    'Gardening': ['Lawn Care', 'Tree Trimming', 'Landscaping', 'Garden Design', 'Pest Control'],
    'Painting': ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Deck Staining', 'Touch-ups'],
    'HVAC': ['AC Repair', 'Heating Repair', 'Duct Cleaning', 'Installation', 'Maintenance']
  };

  // Load existing service data
  useEffect(() => {
    if (!canCreateServices()) {
      navigate('/my-services');
      return;
    }

    const fetchService = async () => {
      try {
        setLoadingService(true);
        const response = await apiService.getServiceById(id);
        const service = response.data;
        
        // Parse availability if it's a string
        let availability = service.availability;
        if (typeof availability === 'string') {
          try {
            availability = JSON.parse(availability);
          } catch (e) {
            console.warn('Could not parse availability:', e);
            availability = {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '17:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '17:00', available: true },
              saturday: { start: '09:00', end: '17:00', available: false },
              sunday: { start: '09:00', end: '17:00', available: false }
            };
          }
        }

        setServiceData({
          title: service.title || '',
          description: service.description || '',
          category: service.category || '',
          subcategory: service.subcategory || '',
          price: service.price?.toString() || '',
          location: service.location || '',
          latitude: service.latitude,
          longitude: service.longitude,
          availability: availability || {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '17:00', available: false },
            sunday: { start: '09:00', end: '17:00', available: false }
          }
        });
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
        navigate('/my-services');
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [id, canCreateServices, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setServiceData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic form validation
      if (!serviceData.title || !serviceData.category || !serviceData.location || !serviceData.description || !serviceData.price) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const requestData = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        subcategory: serviceData.subcategory,
        price: parseFloat(serviceData.price),
        location: serviceData.location,
        latitude: serviceData.latitude,
        longitude: serviceData.longitude,
        availability: JSON.stringify(serviceData.availability)
      };

      await apiService.updateService(id, requestData);
      toast.success('Service updated successfully!');
      navigate('/my-services');
      
    } catch (error) {
      console.error('Error updating service:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update service';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingService) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Service</h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✏️ Update Service
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Service Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                name="title"
                value={serviceData.title}
                onChange={handleInputChange}
                placeholder="e.g., Professional Electrical Services"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={serviceData.price}
                onChange={handleInputChange}
                placeholder="75.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={serviceData.category}
                onChange={(e) => {
                  handleInputChange(e);
                  setServiceData(prev => ({ ...prev, subcategory: '' }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                name="subcategory"
                value={serviceData.subcategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!serviceData.category}
              >
                <option value="">Select Subcategory</option>
                {serviceData.category && categories[serviceData.category]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location *
            </label>
            <LocationSelector
              value={serviceData.location}
              onChange={(location) => setServiceData(prev => ({ ...prev, location }))}
              onCoordinatesChange={(coordinates) => setServiceData(prev => ({ 
                ...prev, 
                latitude: coordinates?.lat || null,
                longitude: coordinates?.lng || null
              }))}
              coordinates={serviceData.latitude && serviceData.longitude ? {
                lat: serviceData.latitude,
                lng: serviceData.longitude
              } : null}
              placeholder="e.g., Downtown, Midtown, or specific areas you serve"
              className="w-full"
            />
          </div>

          {/* Service Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Description *
            </label>
            <textarea
              name="description"
              value={serviceData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your service, experience, and what makes you unique..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              required
            />
          </div>

          {/* Availability Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Availability Schedule
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {Object.entries(serviceData.availability).map(([day, schedule]) => (
                <div key={day} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={`${day}-available`}
                      checked={schedule.available}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`${day}-available`} className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                  </div>
                  
                  {schedule.available && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start</label>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End</label>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/my-services')}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;
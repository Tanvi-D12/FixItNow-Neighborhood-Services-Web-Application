import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import LocationSelector from '../components/LocationSelector';

const CreateService = () => {
  const navigate = useNavigate();
  const { user, canCreateServices, isCustomer, isProvider } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRoleUpgrade, setShowRoleUpgrade] = useState(false);
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    location: '',
    latitude: null,
    longitude: null,
    serviceImages: '',
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
      console.log('=== CREATE SERVICE DEBUG ===');
      
      // Basic form validation
      if (!serviceData.title || !serviceData.category || !serviceData.location || !serviceData.description || !serviceData.price) {
        console.error('Form validation failed - missing required fields');
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (!canCreateServices()) {
        console.error('User does not have permission to create services');
        toast.error('You do not have permission to create services');
        setLoading(false);
        return;
      }
      console.log('User from context:', user);
      console.log('User from localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
      console.log('Access token:', localStorage.getItem('accessToken'));
      console.log('Can create services:', canCreateServices());
      console.log('User role check:', user?.role, 'Expected: PROVIDER or ADMIN');
      
      const servicePayload = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        subcategory: serviceData.subcategory,
        price: parseFloat(serviceData.price),
        location: serviceData.location,
        latitude: serviceData.latitude,
        longitude: serviceData.longitude,
        serviceImages: serviceData.serviceImages,
        availability: JSON.stringify(serviceData.availability)
      };

      console.log('Service payload:', servicePayload);
      console.log('Making API call to:', 'http://localhost:8080/api/services');
      
      // Check authentication token
      const token = localStorage.getItem('accessToken');
      console.log('Auth token exists:', !!token);
      console.log('Auth token preview:', token ? token.substring(0, 20) + '...' : 'No token');

      // Test backend authentication
      try {
        const backendUser = await apiService.debugCurrentUser();
        console.log('Backend user response:', backendUser.data);
        console.log('Backend user role:', backendUser.data.role);
        console.log('Backend authentication success - proceeding with service creation');
      } catch (authError) {
        console.error('Backend authentication error:', authError);
        console.error('Backend auth failed - this might be why service creation fails');
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
        return;
      }

      const response = await apiService.createService(servicePayload);
      console.log('API Response:', response);
      
      toast.success('Service created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('=== CREATE SERVICE ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Failed to create service. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You need PROVIDER role to create services.';
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToProvider = () => {
    navigate('/register?role=provider&upgrade=true');
  };

  // Perfect authentication and authorization handling
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create services.</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/login')} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:blue-700"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register?role=provider')} 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Register as Provider
            </button>
          </div>
        </div>
      </div>
    );
  }



  if (!canCreateServices()) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="text-6xl mb-4">👤➡️🔧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Service Provider</h2>
          <p className="text-gray-600 mb-4">
            Hi <span className="font-semibold">{user.name}</span>! You're currently a <span className="font-semibold text-blue-600">{user.role}</span>.
          </p>
          <p className="text-gray-600 mb-6">
            To create and offer services, you need to upgrade your account to a <span className="font-semibold text-green-600">Service Provider</span>.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleUpgradeToProvider}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
            >
              🚀 Upgrade to Service Provider
            </button>
            <div className="text-sm text-gray-500">
              <p>✅ Create unlimited services</p>
              <p>✅ Manage bookings and earnings</p>
              <p>✅ Build your professional profile</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Service</h1>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✅ Service Provider
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                name="title"
                value={serviceData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Professional Electrical Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={serviceData.price}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="75.00"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={serviceData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!serviceData.category}
              >
                <option value="">Select Subcategory</option>
                {serviceData.category && categories[serviceData.category]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Description *
            </label>
            <textarea
              name="description"
              value={serviceData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your service, experience, and what makes you unique..."
            />
          </div>

          {/* Service Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image URL
            </label>
            <input
              type="url"
              name="serviceImages"
              value={serviceData.serviceImages}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-gray-600 mt-1">
              Add an image URL to showcase your service. If not provided, a default image will be used based on your service category.
            </p>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(serviceData.availability).map(day => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={serviceData.availability[day].available}
                        onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </label>
                  </div>
                  
                  {serviceData.availability[day].available && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-600">Start Time</label>
                        <input
                          type="time"
                          value={serviceData.availability[day].start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600">End Time</label>
                        <input
                          type="time"
                          value={serviceData.availability[day].end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateService;
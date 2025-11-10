import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversation } = useChat();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getDefaultServiceImage = (category) => {
    const defaultImages = {
      'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=400&fit=crop',
      'Carpentry': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=400&fit=crop',
      'Cleaning': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      'Gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
      'Appliance Repair': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    };
    return defaultImages[category] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop';
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await apiService.getServiceById(id);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to fetch service details');
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${id}`);
  };

  const handleContactProvider = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!service?.provider?.id) {
      toast.error('Provider information not available');
      return;
    }

    try {
      await startConversation(service.provider.id, null, {
        otherUserName: service.provider?.name,
        otherUser: service.provider,
      });
      toast.success('Chat opened! Send a message to contact the provider.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to open chat. Please try again.');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <button 
            onClick={handleGoBack}
            className="btn-outline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Service Image */}
          <div className="mb-6">
            <img 
              src={service.serviceImages || service.imageUrl || getDefaultServiceImage(service.category)} 
              alt={service.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = getDefaultServiceImage(service.category);
              }}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{service.description}</p>
          </div>

          {/* Service Details */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Category:</span>
                <p className="text-gray-900">{service.category}</p>
              </div>
              {service.subcategory && (
                <div>
                  <span className="font-medium text-gray-600">Subcategory:</span>
                  <p className="text-gray-900">{service.subcategory}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <p className="text-gray-900">{service.location}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-gray-900">{service.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          {service.availability && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Availability</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {(() => {
                  try {
                    // Parse availability if it's a string, otherwise use as object
                    const availability = typeof service.availability === 'string' 
                      ? JSON.parse(service.availability) 
                      : service.availability;
                    
                    const dayNames = {
                      '0': 'Sunday',
                      '1': 'Monday', 
                      '2': 'Tuesday',
                      '3': 'Wednesday',
                      '4': 'Thursday',
                      '5': 'Friday',
                      '6': 'Saturday'
                    };

                    return Object.entries(availability).map(([day, hours]) => {
                      // Skip if hours is empty, null, or invalid
                      if (!hours || hours === 'null' || hours === '') {
                        return null;
                      }
                      
                      // Handle different formats of hours data
                      let displayHours = '';
                      if (typeof hours === 'string') {
                        displayHours = hours;
                      } else if (typeof hours === 'object' && hours.start && hours.end) {
                        displayHours = `${hours.start} - ${hours.end}`;
                      } else if (typeof hours === 'object' && hours.available) {
                        displayHours = hours.available === true ? 'Available' : 'Not Available';
                      } else {
                        displayHours = 'Available';
                      }
                      
                      return (
                        <div key={day} className="flex justify-between py-2">
                          <span className="font-medium text-gray-600">
                            {dayNames[day] || day}:
                          </span>
                          <span className="text-gray-900">{displayHours}</span>
                        </div>
                      );
                    }).filter(Boolean);
                  } catch (error) {
                    return (
                      <div className="text-gray-500 italic">
                        Available - Contact provider for specific hours
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-600">₹{service.price}</div>
              <div className="text-gray-600">per hour</div>
            </div>

            {/* Provider Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Service Provider</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold text-lg">
                    {service.provider?.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{service.provider?.name || 'Provider'}</p>
                  <p className="text-sm text-gray-600">{service.provider?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleBookNow}
                className="btn-primary w-full py-3 text-lg"
              >
                Book Now
              </button>
              <button 
                onClick={handleContactProvider}
                className="btn-outline w-full py-3"
              >
                Contact Provider
              </button>
            </div>

            {/* Service Tags */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {service.category}
                </span>
                {service.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {service.subcategory}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;